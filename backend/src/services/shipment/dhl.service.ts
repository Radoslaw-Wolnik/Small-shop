// src/services/shipping/dhl-shipping.service.ts

import axios from 'axios';
import { IOrderDocument } from '../../models/order.model';
import Address from '../../models/address.model';
import { ShippingError, NotFoundError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const DHL_API_URL = environment.shipment.dhlApiUrl;
const DHL_API_KEY = environment.shipment.dhlApiKey;

export async function generateDHLShippingLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    const address = await Address.findById(order.shippingAddress);
    if (!address){
      throw new NotFoundError("Address");
    }
    const response = await axios.post(`${DHL_API_URL}/shipments`, {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false
      },
      productCode: "EXPRESS WORLDWIDE",
      accounts: [{ number: environment.shipment.dhlAccountNumber, typeCode: "shipper" }],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: environment.app.company.address.postCode,
            cityName: environment.app.company.address.city,
            countryCode: environment.app.company.address.countryCode,
            addressLine1: `${environment.app.company.address.street} ${environment.app.company.address.buildingNumber}`
          },
          contactInformation: {
            email: environment.app.company.email,
            phone: environment.app.company.phone,
            companyName: environment.app.company.name,
            fullName: environment.app.company.name
          }
        },
        receiverDetails: {
          postalAddress: {
            postalCode: address.zipCode,
            cityName: address.city,
            countryCode: address.country,
            addressLine1: address.street
          },
          contactInformation: {
            email: order.userInfo.email,
            phone: order.userInfo.phone,
            fullName: `${order.userInfo.firstName} ${order.userInfo.lastName}`
          }
        }
      },
      content: {
        packages: [
          {
            weight: 5.5,
            dimensions: {
              length: 30,
              width: 20,
              height: 10
            }
          }
        ],
        isCustomsDeclarable: false,
        description: "Order contents"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${DHL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      url: response.data.documents[0].url,
      trackingNumber: response.data.shipmentTrackingNumber
    };
  } catch (error) {
    throw new ShippingError('Failed to generate DHL shipping label');
  }
}

export async function trackDHLShipment(trackingNumber: string): Promise<any> {
  try {
    const response = await axios.get(`${DHL_API_URL}/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${DHL_API_KEY}`
      }
    });

    return {
      status: response.data.shipments[0].status,
      lastUpdate: response.data.shipments[0].events[0].timestamp,
      estimatedDelivery: response.data.shipments[0].estimatedTimeOfDelivery
    };
  } catch (error) {
    throw new ShippingError('Failed to track DHL shipment');
  }
}