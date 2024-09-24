// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import Product, { IProductDocument } from '../models/product.model';
import ProductTemplate from '../models/product-template.model';
import Category from '../models/category.model';
import Variant from '../models/variant.model';
import User from '../models/user.model';
import { CustomError, NotFoundError, InternalServerError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';


export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      name, description, category, tags, basePrice, variants, 
      defaultPhoto, variantPhotos, inventory, shippingDetails, templateId 
    } = req.body;

    let productData: Partial<IProductDocument> = {
      name,
      description,
      category,
      tags,
      basePrice,
      variants: [],
      defaultPhoto,
      variantPhotos: [],
      inventory: [],
      shippingDetails
    };

    if (templateId) {
      const template = await ProductTemplate.findById(templateId);
      if (!template) {
        throw new NotFoundError('Product template');
      }
      productData = { ...productData, ...template.toObject() };
    }

    for (const variantData of variants) {
      const variant = await Variant.findById(variantData.variant);
      if (!variant) {
        throw new NotFoundError(`Variant with id ${variantData.variant}`);
      }
      productData.variants!.push({
        variant: variant._id,
        options: variantData.options
      });
    }

    productData.variantPhotos = variantPhotos;
    productData.inventory = inventory;

    const product = new Product(productData);
    await product.save();

    logger.info('Product created', { productId: product._id, createdBy: req.user!.id });
    res.status(201).json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating product'));
  }
};


export const updateVariantPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { variantPhotos } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    product.variantPhotos = variantPhotos;
    await product.save();

    logger.info('Product variant photos updated', { productId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product variant photos'));
  }
};


export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info('Product updated', { productId: id, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product'));
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Remove product from all wishlists
    await User.updateMany(
      { wishlist: id },
      { $pull: { wishlist: id } }
    );

    logger.info('Product deleted', { productId: id, deletedBy: req.user!.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting product'));
  }
};

export const addVariant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { variantId, options } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const variant = await Variant.findById(variantId);
    if (!variant) {
      throw new NotFoundError('Variant');
    }

    product.variants.push({ variant: variant._id, options });
    await product.save();

    logger.info('Variant added to product', { productId, variantId, addedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error adding variant to product'));
  }
};

export const updateInventory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { inventory } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    product.inventory = inventory;
    await product.save();

    logger.info('Product inventory updated', { productId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product inventory'));
  }
};

export const updateShippingDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { shippingDetails } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    product.shippingDetails = shippingDetails;
    await product.save();

    logger.info('Product shipping details updated', { productId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating product shipping details'));
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, tags, page = 1, limit = 50 } = req.query;
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('category')
      .populate('variants.variant');

    const total = await Product.countDocuments(query);

    logger.info('Products retrieved', { count: products.length, page, limit });
    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total
    });
  } catch (error) {
    next(new InternalServerError('Error fetching products'));
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('category')
      .populate('variants.variant');

    if (!product) {
      throw new NotFoundError('Product');
    }

    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching product'));
  }
};