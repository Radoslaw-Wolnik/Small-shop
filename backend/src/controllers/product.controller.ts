// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model';
import { CustomError, NotFoundError, InternalServerError } from '../utils/custom-errors.util';


export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(new InternalServerError('Error creating product'));
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error) {
    next(new InternalServerError('Error fetching products'));
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      throw new NotFoundError('Product');
    }
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching product'));
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      throw new NotFoundError('Product');
    }
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product'));
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting product'));
  }
};
