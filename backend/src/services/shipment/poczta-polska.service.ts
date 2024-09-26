// src/services/shipping/poczta-polska-shipping.service.ts

import axios from 'axios';
import { IOrderDocument } from '../../models/order.model';
import { ShippingError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const PP_API_URL = environment.shipment.pocztaPolskaApiUrl;
const PP_API_KEY = environment.shipment.pocztaPolskaApiKey;

export async function generatePocztaPolskaShippingLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    const response = await axios.post(`${PP_API_URL}/shipments`, {
      senderAddress: {
        name: environment.app.company.name,
        street: environment.app.company.address.street,
        houseNumber: environment.app.company.address.buildingNumber,
        city: environment.app.company.address.city,
        zipCode: environment.app.company.address.postCode,
        country: environment.app.company.address.country
      },
      receiverAddress: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        street: order.shippingAddress.street,
        houseNumber: order.shippingAddress.houseNumber,
        city: order.shippingAddress.city,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country
      },
      parcel: {
        weight: 1, // in kg
        width: 30, // in cm
        height: 20, // in cm
        length: 10, // in cm
      },
      service: "ECONOMIC_PACKAGE"
    }, {
      headers: {
        'Authorization': `Bearer ${PP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      url: response.data.labelUrl,
      trackingNumber: response.data.trackingNumber
    };
  } catch (error) {
    throw new ShippingError('Failed to generate Poczta Polska shipping label');
  }
}

export async function trackPocztaPolskaShipment(trackingNumber: string): Promise<any> {
  try {
    const response = await axios.get(`${PP_API_URL}/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${PP_API_KEY}`
      }
    });

    return {
      status: response.data.status,
      lastUpdate: response.data.lastUpdate,
      estimatedDelivery: response.data.estimatedDelivery
    };
  } catch (error) {
    throw new ShippingError('Failed to track Poczta Polska shipment');
  }
}