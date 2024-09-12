// src/controllers/category.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';


export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(new InternalServerError('Error creating category'));
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    next(new InternalServerError('Error fetching categories'));
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      throw new NotFoundError('Category');
    }
    res.json(category);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating category'));
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      throw new NotFoundError('Category');
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting category'));
  }
};
