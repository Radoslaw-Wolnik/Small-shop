// src/services/payment/stripe-payment.service.ts

import Stripe from 'stripe';
import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const stripe = new Stripe(environment.payment.stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function processStripePayment(order: IOrderDocument): Promise<{ success: boolean; transactionId: string }> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects amounts in cents
      currency: 'usd', // Replace with your currency
      payment_method_types: ['card'],
      metadata: { orderId: order._id.toString() }
    });

    return {
      success: true,
      transactionId: paymentIntent.id
    };
  } catch (error) {
    throw new PaymentError('Failed to process Stripe payment');
  }
}

export async function verifyStripePayment(transactionId: string): Promise<{ verified: boolean; amount: number }> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    return {
      verified: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount / 100 // Convert back from cents to dollars
    };
  } catch (error) {
    throw new PaymentError('Failed to verify Stripe payment');
  }
}