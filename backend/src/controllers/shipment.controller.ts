// src/controllers/shipping.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError, InternalServerError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import Order from '../models/order.model';
// Import shipping provider services
import { generatePocztaPolskaLabel, trackPocztaPolskaShipment } from '../services/shipment/poczta-polska.service';
import { generateDHLLabel, trackDHLShipment } from '../services/shipment/dhl.service';
import { generateAmazonLabel, trackAmazonShipment } from '../services/shipment/amazon.service';
import { generatePaczkomatyLabel, trackPaczkomatyShipment } from '../services/shipment/paczkomaty.service';

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
        shippingLabel = await generatePocztaPolskaLabel(order);
        break;
      case 'dhl':
        shippingLabel = await generateDHLLabel(order);
        break;
      case 'amazon':
        shippingLabel = await generateAmazonLabel(order);
        break;
      case 'paczkomaty':
        shippingLabel = await generatePaczkomatyLabel(order);
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
      case 'paczkomaty':
        trackingInfo = await trackPaczkomatyShipment(order.trackingNumber);
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
    // do sth else if token expired

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
      case 'paczkomaty':
        trackingInfo = await trackPaczkomatyShipment(trackingNumber);
        break;
      default:
        throw new BadRequestError('Invalid shipping provider');
    }

    res.json(trackingInfo);
  } catch (error) {
    next(error);
  }
};