// src/controllers/variant.controller.ts
import { Request, Response, NextFunction } from 'express';
import Variant from '../models/variant.model';
import { CustomError, NotFoundError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const getVariants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const variants = await Variant.find();
    res.json(variants);
  } catch (error) {
    next(new InternalServerError('Error fetching variants'));
  }
};

export const createVariant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, options, changesPhoto, changesPrice, } = req.body;

    const variant = new Variant({
      name,
      changesPhoto,
      changesPrice,
      options
    });

    await variant.save();

    logger.info('Variant created', { variantId: variant._id, createdBy: req.user!.id });
    res.status(201).json(variant);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating variant'));
  }
};

export const updateVariant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const variant = await Variant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!variant) {
      throw new NotFoundError('Variant');
    }

    logger.info('Variant updated', { variantId: id, updatedBy: req.user!.id });
    res.json(variant);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating variant'));
  }
};

export const deleteVariant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // remove variant only if its not used in products 
    const variant = await Variant.findByIdAndDelete(id);

    if (!variant) {
      throw new NotFoundError('Variant');
    }

    logger.info('Variant deleted', { variantId: id, deletedBy: req.user!.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting variant'));
  }
};