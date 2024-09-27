// src/controllers/shipping.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError, InternalServerError, BadRequestError, ExpiredTokenError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import Order from '../models/order.model';
// Import shipping provider services
import { generatePocztaPolskaShippingLabel, trackPocztaPolskaShipment } from '../services/shipment/poczta-polska.service';
import { generateDHLShippingLabel, trackDHLShipment } from '../services/shipment/dhl.service';
import { generateAmazonShippingLabel, trackAmazonShipment } from '../services/shipment/amazon.service';
import { generateInPostShippingLabel, trackInPostShipment } from '../services/shipment/inPost.service';

export const generateShippingLabel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, provider } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    let shippingLabel;
    switch (provider) {
      case 'poczta-polska':
        shippingLabel = await generatePocztaPolskaShippingLabel(order);
        break;
      case 'dhl':
        shippingLabel = await generateDHLShippingLabel(order);
        break;
      case 'amazon':
        shippingLabel = await generateAmazonShippingLabel(order);
        break;
      case 'paczkomaty':
        shippingLabel = await generateInPostShippingLabel(order);
        break;
      default:
        throw new BadRequestError('Invalid shipping provider');
    }

    order.shippingLabel = shippingLabel.url;
    order.trackingNumber = shippingLabel.trackingNumber;
    order.shippingProvider = provider;
    order.status = 'shipped';
    await order.save();

    logger.info('Shipping label generated', { orderId, provider, userId: req.user!.id });
    res.json({ shippingLabel: shippingLabel.url, trackingNumber: shippingLabel.trackingNumber });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error generating shipping label'));
  }
};

export const trackShipment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!order.trackingNumber || !order.shippingProvider) {
      throw new BadRequestError('Shipping information not available');
    }

    let trackingInfo;
    switch (order.shippingProvider) {
      case 'poczta-polska':
        trackingInfo = await trackPocztaPolskaShipment(order.trackingNumber);
        break;
      case 'dhl':
        trackingInfo = await trackDHLShipment(order.trackingNumber);
        break;
      case 'amazon':
        trackingInfo = await trackAmazonShipment(order.trackingNumber);
        break;
      case 'inpost':
        trackingInfo = await trackInPostShipment(order.trackingNumber);
        break;
      default:
        throw new BadRequestError('Invalid shipping provider');
    }

    res.json(trackingInfo);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error tracking shipment'));
  }
};


export const updateShippingStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.status = status;
    await order.save();

    logger.info('Shipping status updated', { orderId, status, userId: req.user!.id });
    res.json({ message: 'Shipping status updated successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating shipping status'));
  }
};

// tracking info for not logge din users (or just log in using the one time link to check im not sure whats the best aproach)
export const TrackShippmentAnonymous = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, trackingNumber } = req.params;

    const order = await Order.findOne({ trackingNumber, anonToken: token });
    if (!order) {
      throw new NotFoundError('Order not found or invalid token');
    }

    // Check if the token has expired
    if (order.anonTokenExpires && order.anonTokenExpires < new Date()) {
      throw new ExpiredTokenError('Tracking token has expired');
    }

    let trackingInfo;
    switch (order.shippingProvider) {
      case 'poczta-polska':
        trackingInfo = await trackPocztaPolskaShipment(trackingNumber);
        break;
      case 'dhl':
        trackingInfo = await trackDHLShipment(trackingNumber);
        break;
      case 'amazon':
        trackingInfo = await trackAmazonShipment(trackingNumber);
        break;
      case 'inpost':
        trackingInfo = await trackInPostShipment(trackingNumber);
        break;
      default:
        throw new BadRequestError('Invalid shipping provider');
    }

    res.json(trackingInfo);
  } catch (error) {
    next(error);
  }
};