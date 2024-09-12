// src/controllers/productTemplate.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductTemplate } from '../models/product-template.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';


export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = new ProductTemplate(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    next(new InternalServerError('Error creating product template'));
  }
};

export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await ProductTemplate.find().populate('category');
    res.json(templates);
  } catch (error) {
    next(new InternalServerError('Error creating product templates'));
  }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await ProductTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) {
      throw new NotFoundError('ProductTemplate');
    }
    res.json(template);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product template'));
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await ProductTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      throw new NotFoundError('ProductTemplate');
    }
    res.json({ message: 'Product template deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting product template'));
  }
};
