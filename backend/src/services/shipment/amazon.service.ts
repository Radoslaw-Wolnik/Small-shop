// src/services/shipment/amazon-shipping.service.ts

import axios from 'axios';
import { IOrderDocument } from '../../models/order.model';
import { CustomError, ShippingError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

// You would typically get these from your Amazon Seller Central account
const AMAZON_API_URL = environment.shipping.amazonApiUrl;
const AMAZON_SELLER_ID = environment.shipping.amazonSellerId;
const AMAZON_ACCESS_KEY = environment.shipping.amazonAccessKey;
const AMAZON_SECRET_KEY = environment.shipping.amazonSecretKey;

export async function generateAmazonLabel(order: IOrderDocument): Promise<{ url: string; trackingNumber: string }> {
  try {
    // In a real implementation, you would make an API call to Amazon's Merchant Fulfillment API
    // This is a simplified example
    const response = await axios.post(`${AMAZON_API_URL}/shipping/v1/shipments`, {
      sellerId: AMAZON_SELLER_ID,
      shipmentRequestDetails: {
        amazon_order_id: order._id.toString(),
        item_list: order.products.map(product => ({
          orderItemId: product.product.toString(),
          quantity: product.quantity
        })),
        ship_from_address: {
          name: 'Your Store Name',
          address_line1: 'Your Address Line 1',
          city: 'Your City',
          state_or_province_code: 'YS',
          postal_code: 'Your Postal Code',
          country_code: 'Your Country Code'
        },
        ship_to_address: order.shippingAddress,
        shipping_service_options: {
          delivery_experience: 'DeliveryConfirmationWithAdultSignature',
          carrier_will_pick_up: false,
          declared_value: {
            currency_code: 'USD',
            amount: order.totalAmount
          }
        }
      }
    }, {
      headers: {
        'x-amz-access-token': AMAZON_ACCESS_KEY,
        'x-amz-secret-token': AMAZON_SECRET_KEY
      }
    });

    return {
      url: response.data.label_url,
      trackingNumber: response.data.tracking_id
    };
  } catch (error) {
    throw new ShippingError('Failed to generate Amazon shipping label');
  }
}

export async function trackAmazonShipment(trackingNumber: string): Promise<any> {
  try {
    // In a real implementation, you would make an API call to Amazon's tracking service
    const response = await axios.get(`${AMAZON_API_URL}/tracking/v1/trackingInfo/${trackingNumber}`, {
      headers: {
        'x-amz-access-token': AMAZON_ACCESS_KEY,
        'x-amz-secret-token': AMAZON_SECRET_KEY
      }
    });

    return {
      status: response.data.tracking_status,
      lastUpdate: response.data.last_update_date,
      estimatedDelivery: response.data.estimated_delivery_date
    };
  } catch (error) {
    throw new ShippingError('Failed to track Amazon shipment');
  }
}