// src/controllers/shipping.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError, InternalServerError, BadRequestError, ExpiredTokenError, UnauthorizedError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import Order from '../models/order.model';
import User from '../models/user.model';
// Import shipping provider services
import { generatePocztaPolskaShippingLabel, trackPocztaPolskaShipment } from '../services/shipment/poczta-polska.service';
import { generateDHLShippingLabel, trackDHLShipment } from '../services/shipment/dhl.service';
import { generateAmazonShippingLabel, trackAmazonShipment } from '../services/shipment/amazon.service';
import { generateInPostShippingLabel, trackInPostShipment } from '../services/shipment/inPost.service';
import environment from '../config/environment';

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

    if (order.user.toString() !== req.user!._id.toString()) {
      throw new UnauthorizedError('Not authorized to track this shipment');
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
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.status = status;
    order.trackingNumber = trackingNumber;
    await order.save();


    // Send shipping status update email
    await environment.email.service.sendTemplatedEmail(
      order.userInfo.email,
      'shipmentUpdate',
      {
        orderId: order._id,
        shippingStatus: status,
        trackingNumber,
        frontendUrl: environment.app.frontend,
        token: order.anonToken
      },
      { id: order.user.toString(), isAnonymous: order.userInfo.isAnonymous }
    );

    logger.info('Shipping status updated', { orderId, status, userId: req.user!.id });
    res.json({ message: 'Shipping status updated successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating shipping status'));
  }
};
