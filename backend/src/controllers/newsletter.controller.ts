// src/controllers/newsletter.controller.ts
import { Request, Response, NextFunction } from 'express';
import Newsletter from '../models/newsletter.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import sendEmail from '../services/email.service';
import User from '../models/user.model';

export const getNewsletters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletters = await Newsletter.find();
    res.json(newsletters);
  } catch (error) {
    next(new InternalServerError('Error fetching newsletters'));
  }
};

export const createNewsletter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, scheduledDate } = req.body;
    const newsletter = new Newsletter({
      title,
      content,
      scheduledDate,
      status: 'draft'
    });
    await newsletter.save();
    logger.info('Newsletter created', { newsletterId: newsletter._id, createdBy: req.user?.id });
    res.status(201).json(newsletter);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating newsletter'));
  }
};

export const updateNewsletter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, scheduledDate } = req.body;
    const newsletter = await Newsletter.findByIdAndUpdate(id, { title, content, scheduledDate }, { new: true });
    if (!newsletter) {
      throw new NotFoundError('Newsletter');
    }
    logger.info('Newsletter updated', { newsletterId: id, updatedBy: req.user?.id });
    res.json(newsletter);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating newsletter'));
  }
};


export const scheduleNewsletter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;
    const newsletter = await Newsletter.findByIdAndUpdate(id, { scheduledDate, status: 'scheduled' }, { new: true });
    if (!newsletter) {
      throw new NotFoundError('Newsletter');
    }
    logger.info('Newsletter scheduled', { newsletterId: id, scheduledDate, scheduledBy: req.user?.id });
    res.json(newsletter);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error scheduling newsletter'));
  }
};


export const deleteNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) {
      throw new NotFoundError('Newsletter');
    }
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting newsletter'));
  }
};


export const sendNewsletter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      throw new NotFoundError('Newsletter');
    }

    const subscribers = await User.find({ 'notificationPreferences.newsletters': true });
    
    for (const subscriber of subscribers) {
      await sendEmail({
        to: await subscriber.getDecryptedEmail(),
        subject: newsletter.title,
        html: newsletter.content
      });
    }

    newsletter.status = 'sent';
    newsletter.sentDate = new Date();
    await newsletter.save();

    logger.info('Newsletter sent', { newsletterId: id, recipientCount: subscribers.length, sentBy: req.user?.id });
    res.json({ message: 'Newsletter sent successfully', recipientCount: subscribers.length });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error sending newsletter'));
  }
};

export const getSubscribers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subscribers = await User.find({ 'notificationPreferences.newsletters': true }).select('username email');
    logger.info('Subscribers list retrieved', { count: subscribers.length });
    res.json(subscribers);
  } catch (error) {
    next(new InternalServerError('Error fetching subscribers'));
  }
};

// ... (you can add more functions as needed)