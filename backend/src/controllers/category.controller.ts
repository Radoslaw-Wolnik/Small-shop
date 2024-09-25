// src/controllers/category.controller.ts
import { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model';
import { CustomError, NotFoundError, InternalServerError, BadRequestError } from '../utils/custom-errors.util';
import slugify from 'slugify';
import logger from '../utils/logger.util';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, parent, seo } = req.body;

    const slug = slugify(name, { lower: true, strict: true });
    const existingCategory = await Category.findOne({ 'seo.slug': slug });
    if (existingCategory) {
      throw new BadRequestError('A category with this name already exists');
    }

    const category = new Category({
      name,
      description,
      parent,
      seo: { ...seo, slug }
    });

    await category.save();
    logger.info('Category created', { categoryId: category._id, createdBy: req.user?.id });
    res.status(201).json(category);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating category'));
  }
};


export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find().populate('parent');
    logger.info('Categories retrieved', { count: categories.length });
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
    // or just next(error)
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