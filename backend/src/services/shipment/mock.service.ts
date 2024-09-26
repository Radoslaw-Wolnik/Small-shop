// src/services/shipping/mock.service.ts

import { IOrderDocument } from '../../models/order.model';
import { ShippingError } from '../../utils/custom-errors.util';

export async function generateMockShippingLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    const trackingNumber = `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const labelUrl = `https://mockshipping.com/label/${trackingNumber}`;
    return { url: labelUrl, trackingNumber };
  } catch (error) {
    throw new ShippingError('Failed to generate mock shipping label');
  }
}

export async function trackMockShipment(trackingNumber: string): Promise<any> {
  try {
    return {
      status: ['In Transit', 'Out for Delivery', 'Delivered'][Math.floor(Math.random() * 3)],
      lastUpdate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    throw new ShippingError('Failed to track mock shipment');
  }
}