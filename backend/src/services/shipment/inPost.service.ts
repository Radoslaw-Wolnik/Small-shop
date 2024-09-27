// src/services/shipping/inPost-shipping.service.ts

import axios from 'axios';
import { IOrderDocument } from '../../models/order.model';
import Address from '../../models/address.model';
import { ShippingError, NotFoundError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';
import { add } from 'winston';

const INPOST_API_URL = environment.shipment.inpostApiUrl;
const INPOST_API_KEY = environment.shipment.inpostApiKey;

export async function generateInPostShippingLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    const address = await Address.findById(order.shippingAddress);
    if (!address){
      throw new NotFoundError("Address");
    }
    const response = await axios.post(`${INPOST_API_URL}/shipments`, {
      sender: {
        name: environment.app.company.name,
        company_name: environment.app.company.name,
        email: environment.app.company.email,
        phone: environment.app.company.phone,
        address: {
          street: environment.app.company.address.street,
          building_number: environment.app.company.address.buildingNumber,
          city: environment.app.company.address.city,
          post_code: environment.app.company.address.postCode,
          country_code: environment.app.company.address.countryCode,
        }
      },
      receiver: {
        name: `${order.userInfo.firstName} ${order.userInfo.lastName}`,
        email: order.userInfo.email,
        phone: order.userInfo.phone,
        address: {
          street: address.street,
          building_number: address.buildingNumber,
          city: address.city,
          post_code: address.zipCode,
          country_code: "PL"
        }
      },
      parcels: [
        {
          dimensions: {
            length: 30,
            width: 20,
            height: 10
          },
          weight: {
            amount: 1,
            unit: "kg"
          }
        }
      ],
      service: "inpost_locker_standard"
    }, {
      headers: {
        'Authorization': `Bearer ${INPOST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      url: response.data.label_url,
      trackingNumber: response.data.tracking_number
    };
  } catch (error) {
    throw new ShippingError('Failed to generate Paczkomaty shipping label');
  }
}

export async function trackInPostShipment(trackingNumber: string): Promise<any> {
  try {
    const response = await axios.get(`${INPOST_API_URL}/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${INPOST_API_KEY}`
      }
    });

    return {
      status: response.data.status,
      lastUpdate: response.data.last_event.datetime,
      estimatedDelivery: response.data.estimated_delivery_datetime
    };
  } catch (error) {
    throw new ShippingError('Failed to track Paczkomaty shipment');
  }
}