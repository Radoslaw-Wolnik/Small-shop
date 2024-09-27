import { Request, Response, NextFunction } from 'express';
import Dispute from '../models/dispiute-order.model';
import Order from '../models/order.model';
import { NotFoundError, UnauthorizedError, BadRequestError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import environment from '../config/environment';
import { generateAnonymousToken } from '../middleware/auth.middleware';

export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { reason, description } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user.toString() !== req.user!._id.toString()) {
      throw new UnauthorizedError('Not authorized to create a dispute for this order');
    }

    const dispute = new Dispute({
      order: orderId,
      user: req.user!._id,
      reason,
      description
    });

    await dispute.save();

    const token = generateAnonymousToken(req.user!);
    const userEmail = await req.user!.getDecryptedEmail();

    await environment.email.service?.sendTemplatedEmail(
      userEmail,
      'disputeConfirmation',
      {
        orderId: orderId,
        disputeId: dispute.id,
        frontendUrl: environment.app.frontend,
        token: token
      }
    );

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

    // or insted of doing req.user! you can just at begginig make if for req.user
    if (dispute.user.toString() !== req.user!._id.toString() && req.user!.role !== 'owner' ) {
      throw new UnauthorizedError('Not authorized to view this dispute');
    }

    logger.info('Dispute details retrieved', { disputeId: id, userId: req.user!.id });
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