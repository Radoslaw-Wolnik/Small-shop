// src/services/shipping/amazon-shipping.service.ts

import axios from 'axios';
import crypto from 'crypto';
import { IOrderDocument } from '../../models/order.model';
import Address from '../../models/address.model';
import { NotFoundError, ShippingError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const AMAZON_API_URL = environment.shipment.amazonApiUrl;
const AMAZON_ACCESS_KEY = environment.shipment.amazonAccessKey;
const AMAZON_SECRET_KEY = environment.shipment.amazonSecretKey;
const AMAZON_SELLER_ID = environment.shipment.amazonSellerId;

function generateAmazonAuthHeader(method: string, path: string, data: string = '') {
  const timestamp = new Date().toISOString();
  const stringToSign = `${method}\n${path}\n\nhost:${new URL(AMAZON_API_URL).host}\nx-amz-date:${timestamp}\n\nhost;x-amz-date\n${crypto.createHash('sha256').update(data).digest('hex')}`;
  const signature = crypto.createHmac('sha256', AMAZON_SECRET_KEY).update(stringToSign).digest('hex');
  return `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${timestamp.substr(0, 8)}/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`;
}

export async function generateAmazonShippingLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    const address = await Address.findById(order.shippingAddress);
    if (!address){
      throw new NotFoundError("Address");
    }

    const path = '/shipping/v1/shipments';
    const data = JSON.stringify({
      shipmentRequestDetails: {
        amazonOrderId: order.id.toString(),
        sellerOrderId: order.id.toString(),
        itemList: order.products.map(product => ({
          orderItemId: product.product.toString(),
          quantity: product.quantity
        })),
        shipFromAddress: {
          name: "Your Company Name",
          addressLine1: "Your Street",
          city: "Your City",
          stateOrProvinceCode: "YS",
          postalCode: "Your Zip Code",
          countryCode: "US"
        },
        shipToAddress: {
          name: `${order.userInfo.firstName} ${order.userInfo.lastName}`,
          addressLine1: address.street,
          city: address.city,
          stateOrProvinceCode: address.state,
          postalCode: address.zipCode,
          countryCode: address.country
        },
        packageDimensions: {
          length: 30,
          width: 20,
          height: 10,
          unit: "centimeters"
        },
        weight: {
          value: 1,
          unit: "kilograms"
        },
        shippingServiceOptions: {
          deliveryExperience: "DeliveryConfirmationWithoutSignature",
          carrierWillPickUp: false,
          declaredValue: {
            currencyCode: "USD",
            amount: order.totalAmount
          }
        }
      }
    });

    const response = await axios.post(`${AMAZON_API_URL}${path}`, data, {
      headers: {
        'Authorization': generateAmazonAuthHeader('POST', path, data),
        'Content-Type': 'application/json',
        'x-amz-seller-id': AMAZON_SELLER_ID
      }
    });

    return {
      url: response.data.payload.labelResults.labelDownloadURL,
      trackingNumber: response.data.payload.trackingId
    };
  } catch (error) {
    throw new ShippingError('Failed to generate Amazon shipping label');
  }
}

export async function trackAmazonShipment(trackingNumber: string): Promise<any> {
  try {
    const path = `/shipping/v1/tracking/${trackingNumber}`;
    const response = await axios.get(`${AMAZON_API_URL}${path}`, {
      headers: {
        'Authorization': generateAmazonAuthHeader('GET', path),
        'x-amz-seller-id': AMAZON_SELLER_ID
      }
    });

    return {
      status: response.data.payload.trackingStatus,
      lastUpdate: response.data.payload.eventHistory[0].eventDate,
      estimatedDelivery: response.data.payload.promisedDeliveryDate
    };
  } catch (error) {
    throw new ShippingError('Failed to track Amazon shipment');
  }
}