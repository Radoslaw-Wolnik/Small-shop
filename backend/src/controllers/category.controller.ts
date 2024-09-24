// src/controllers/category.controller.ts
import { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model';
import { CustomError, NotFoundError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, parent } = req.body;

    const category = new Category({
      name,
      description,
      parent
    });

    await category.save();

    logger.info('Category created', { categoryId: category._id, createdBy: req.user!.id });
    res.status(201).json(category);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating category'));
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find().populate('parent');
    res.json(categories);
  } catch (error) {
    next(new InternalServerError('Error fetching categories'));
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!category) {
      throw new NotFoundError('Category');
    }

    logger.info('Category updated', { categoryId: id, updatedBy: req.user!.id });
    res.json(category);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating category'));
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundError('Category');
    }

    logger.info('Category deleted', { categoryId: id, deletedBy: req.user!.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting category'));
  }
};