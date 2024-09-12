// src/controllers/message.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';


export const createMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const message = new Message({
      user: req.user!.id,
      content: req.body.content,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    next(new InternalServerError('Error creating message'));
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.find().populate('user', 'username');
    res.json(messages);
  } catch (error) {
    next(new InternalServerError('Error fetching messages'));
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      throw new NotFoundError('Message');
    }
    res.json(message);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error marking message as read'));
  }
};
