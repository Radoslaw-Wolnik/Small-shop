// src/controllers/message.controller.ts
import { Request, Response, NextFunction } from 'express';
import Message from '../models/message.model';
import { NotFoundError, UnauthorizedError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createMessage = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { content, category, relatedOrder, relatedDispute } = req.body;
    const files = req.files as Express.Multer.File[];

    const message = new Message({
      sender: req.user?.id,
      content,
      category,
      relatedOrder,
      relatedDispute,
      attachments: req.body.attachments || []
    });

    await message.save();
    logger.info('Message created', { messageId: message._id, userId: req.user?.id });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.find().populate('sender', 'username').sort({ createdAt: -1 });
    logger.info('Messages retrieved', { count: messages.length, userId: req.user?.id });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      throw new NotFoundError('Message');
    }

    message.readStatus = true;
    await message.save();

    logger.info('Message marked as read', { messageId: id, userId: req.user?.id });
    res.json(message);
  } catch (error) {
    next(error);
  }
};


export const addPhotosToMessage = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) {
      throw new NotFoundError('Message');
    }
    if (req.user && message.sender.toString() !== req.user.id && req.user.role !== 'owner') {
      throw new UnauthorizedError('Not authorized to update this message');
    }
    
    if (req.body.attachments && req.body.attachments.length > 0) {
      message.attachments.push(...req.body.attachments);
      await message.save();
    }

    logger.info('Attachments added to message', { messageId: id, userId: req.user?.id });
    res.json(message);
  } catch (error) {
    next(error);
  }
};
