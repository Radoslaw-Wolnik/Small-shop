// src/controllers/newsletter.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Newsletter } from '../models/newsletter.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';


export const createNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletter = new Newsletter(req.body);
    await newsletter.save();
    res.status(201).json(newsletter);
  } catch (error) {
    next(new InternalServerError('Error creating newsletter'));
  }
};

export const getNewsletters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletters = await Newsletter.find();
    res.json(newsletters);
  } catch (error) {
    next(new InternalServerError('Error fetching newsletters'));
  }
};

export const updateNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newsletter = await Newsletter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!newsletter) {
      throw new NotFoundError('Newsletter');
    }
    res.json(newsletter);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating newsletter'));
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
