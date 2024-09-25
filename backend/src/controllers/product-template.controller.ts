// src/controllers/product-template.controller.ts
import { Request, Response, NextFunction } from 'express';
import ProductTemplate from '../models/product-template.model';
import { CustomError, NotFoundError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createProductTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, category, tags, variants, shippingDetails } = req.body;

    const template = new ProductTemplate({
      name,
      category,
      tags,
      variants,
      shippingDetails
    });

    await template.save();

    logger.info('Product template created', { templateId: template._id, createdBy: req.user!.id });
    res.status(201).json(template);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating product template'));
  }
};

export const getProductTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = await ProductTemplate.find().populate('category').populate('variants');
    res.json(templates);
  } catch (error) {
    next(new InternalServerError('Error fetching product templates'));
  }
};

export const updateProductTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await ProductTemplate.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!template) {
      throw new NotFoundError('Product template');
    }

    logger.info('Product template updated', { templateId: id, updatedBy: req.user!.id });
    res.json(template);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product template'));
  }
};

export const deleteProductTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await ProductTemplate.findByIdAndDelete(id);
    if (!template) {
      throw new NotFoundError('Product template');
    }

    logger.info('Product template deleted', { templateId: id, deletedBy: req.user!.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting product template'));
  }
};

export const getProductTemplateDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { id } = req.params;
    const template = await ProductTemplate.findById(id).populate('category').populate('variants');
    if (!template) {
      throw new NotFoundError('Product template');
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const useProductTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { id } = req.params;
    const template = await ProductTemplate.findById(id);
    if (!template) {
      throw new NotFoundError('Product template');
    }

    // Here you would typically create a new product based on the template
    // This is a simplified example
    const newProduct = {
      ...template.toObject(),
      _id: undefined,
      name: `${template.name} - Copy`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.info('Product created from template', { templateId: id, createdBy: req.user!.id });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};