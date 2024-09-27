// src/services/payment/stripe-payment.service.ts

import Stripe from 'stripe';
import { IOrderDocument } from '../../models/order.model';
import { PaymentError } from '../../utils/custom-errors.util';
import environment from '../../config/environment';

const stripe = new Stripe(environment.payment.stripeSecretKey, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function processStripePayment(order: IOrderDocument): Promise<PaymentInitializationResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects amounts in cents
      currency: 'usd', // Replace with your currency
      payment_method_types: ['card'],
      metadata: { orderId: order.id.toString() }
    });

    return {
      success: true,
      transactionId: paymentIntent.id,
      paymentUrl: paymentIntent.next_action?.redirect_to_url?.url
    };
  } catch (error) {
    throw new PaymentError('Failed to process Stripe payment');
  }
}

export async function verifyStripePayment(transactionId: string): Promise<PaymentVerificationResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    return {
      success: paymentIntent.status === 'succeeded',
      orderId: paymentIntent.metadata.orderId
    };
  } catch (error) {
    throw new PaymentError('Failed to verify Stripe payment');
  }
}