import { Request, Response, NextFunction } from 'express';
import Dispute from '../models/dispiute-order.model';
import Order from '../models/order.model';
import { NotFoundError, UnauthorizedError, BadRequestError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createDisputeWithToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, token } = req.params;
    const { reason, description } = req.body;

    const order = await Order.findOne({ _id: orderId, magicLink: token });
    if (!order) {
      throw new NotFoundError('Order not found or token is invalid');
    }

    const dispute = new Dispute({
      order: orderId,
      user: order.user,
      reason,
      description,
      attachments: req.body.attachments || []
    });

    await dispute.save();
    order.status = 'disputed';
    await order.save();

    logger.info('Dispute created with token', { disputeId: dispute._id, orderId });
    res.status(201).json(dispute);
  } catch (error) {
    next(error);
  }
};

export const getDisputeDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id).populate('order');

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    if (req.user && dispute.user.toString() !== req.user.id && req.user.role !== 'owner') {
      throw new UnauthorizedError('Not authorized to view this dispute');
    }

    logger.info('Dispute details retrieved', { disputeId: id, userId: req.user?.id });
    res.json(dispute);
  } catch (error) {
    next(error);
  }
};

export const listDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disputes = await Dispute.find().populate('order').populate('user', 'username email');
    logger.info('Disputes list retrieved', { count: disputes.length, userId: req.user?.id });
    res.json(disputes);
  } catch (error) {
    next(error);
  }
};

export const updateDisputeStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    dispute.status = status;
    dispute.resolution = resolution;
    await dispute.save();

    logger.info('Dispute status updated', { disputeId: id, status, updatedBy: req.user?.id });
    res.json(dispute);
  } catch (error) {
    next(error);
  }
};

export const deleteDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id);

    if (!dispute) {
      throw new NotFoundError('Dispute');
    }

    if (dispute.status !== 'resolved') {
      throw new BadRequestError('Cannot delete an unresolved dispute');
    }

    await Dispute.findByIdAndDelete(id);
    logger.info('Dispute deleted', { disputeId: id, deletedBy: req.user?.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// not sure if ony AuthRequestWith File as it may be user that makes the dispute with token - unless we will always log in such user < -
export const addAttachmentToDispute = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id);
    if (!dispute) {
      throw new NotFoundError('Dispute');
    }
    if (req.user && dispute.user.toString() !== req.user.id && req.user.role !== 'owner') {
      throw new UnauthorizedError('Not authorized to update this dispute');
    }
    
    if (req.body.attachments && req.body.attachments.length > 0) {
      dispute.attachments.push(...req.body.attachments);
      await dispute.save();
    }

    logger.info('Attachments added to dispute', { disputeId: id, userId: req.user?.id });
    res.json(dispute);
  } catch (error) {
    next(error);
  }
};