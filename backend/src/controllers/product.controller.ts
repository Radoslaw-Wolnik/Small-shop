// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import Product, { IProductDocument } from '../models/product.model';
import Category from '../models/category.model';
import Variant from '../models/variant.model';
import Order from '../models/order.model';
import Tag from '../models/tag.model';
import { NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

import slugify from 'slugify';

export const createProduct = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { name, description, category, basePrice, variants, shippingDetails, seo } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const slug = slugify(name, { lower: true, strict: true });
    const existingProduct = await Product.findBySlug(slug);
    if (existingProduct) {
      throw new BadRequestError('A product with this name already exists');
    }

    const product = new Product({
      name,
      description,
      category,
      basePrice,
      variants,
      shippingDetails,
      seo: { ...seo, slug },
      defaultPhoto: files.defaultPhoto[0].path,
      images: files.images.map(file => ({ url: file.path, altText: file.originalname }))
    });

    await product.save();
    logger.info('Product created', { productId: product._id, createdBy: req.user?.id });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tags, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    const products = await Product.find(query)
      .populate('category')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    logger.info('Products retrieved', { count: products.length, page, limit });
    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category');

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info('Product details retrieved', { productId: id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (updateData.name) {
      const newSlug = slugify(updateData.name, { lower: true, strict: true });
      const existingProduct = await Product.findBySlug(newSlug);
      if (existingProduct && existingProduct.id.toString() !== id) {
        throw new BadRequestError('A product with this name already exists');
      }
      updateData.seo = updateData.seo || {};
      updateData.seo.slug = newSlug;
    }

    if (files.defaultPhoto) {
      updateData.defaultPhoto = files.defaultPhoto[0].path;
    }

    if (files.images) {
      updateData.images = files.images.map(file => ({ url: file.path, altText: file.originalname }));
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info('Product updated', { productId: id, updatedBy: req.user?.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info('Product deleted', { productId: id, deletedBy: req.user?.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


export const addVariant = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    product.variants.push({ variant: variant.id, options });
    await product.save();

    logger.info('Variant added to product', { productId, variantId, addedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const addTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { tagId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      throw new NotFoundError('Tag');
    }

    if (!product.tags.includes(tag.id)) {
      product.tags.push(tag.id);
      await product.save();
    }

    logger.info('Tag added to product', { productId, tagId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const removeTag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { tagId } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $pull: { tags: tagId } },
      { new: true }
    );

    if (!product) {
      throw new NotFoundError('Product');
    }

    logger.info('Tag removed from product', { productId, tagId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

export const updateShippingDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

export const getProductsByTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags } = req.query;
    const tagIds = Array.isArray(tags) ? tags : [tags];

    const products = await Product.find({ tags: { $in: tagIds } }).populate('category tags');
    logger.info('Products retrieved by tags', { tags: tagIds, count: products.length });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate('category');
    logger.info('Products retrieved by category', { categoryId, count: products.length });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductsByTagsAndCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags, categoryId } = req.query;
    const tagArray = Array.isArray(tags) ? tags : [tags];

    const products = await Product.find({
      tags: { $in: tagArray },
      category: categoryId
    }).populate('category');

    logger.info('Products retrieved by tags and category', { tags: tagArray, categoryId, count: products.length });
    res.json(products);
  } catch (error) {
    next(error);
  }
};


export const updateVariantPhotos = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { variantId, optionId } = req.body;
    const files = req.files as Express.Multer.File[];

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const variantIndex = product.variants.findIndex(v => v.variant.toString() === variantId);
    if (variantIndex === -1) {
      throw new NotFoundError('Variant');
    }

    const newImages = files.map(file => ({
      url: file.path,
      altText: file.originalname,
      variantOption: {
        variant: variantId,
        option: optionId
      }
    }));

    product.images.push(...newImages);
    await product.save();

    logger.info('Variant photos updated', { productId, variantId, optionId, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const saveProductPhotos = async (req: AuthRequestWithFiles, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const files = req.files as Express.Multer.File[];

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const newImages = files.map(file => ({
      url: file.path,
      altText: file.originalname
    }));

    product.images.push(...newImages);
    await product.save();

    logger.info('Product photos saved', { productId, count: files.length, updatedBy: req.user!.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const copyProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { newName } = req.body;

    const originalProduct = await Product.findById(productId);
    if (!originalProduct) {
      throw new NotFoundError('Product');
    }

    // Create a new slug based on the new name
    const newSlug = slugify(newName, { lower: true, strict: true });
    const existingProduct = await Product.findBySlug(newSlug);
    if (existingProduct) {
      throw new BadRequestError('A product with this name already exists');
    }

    // Create a new product object with copied data
    const copiedProductData: Partial<IProductDocument> = {
      name: newName,
      description: originalProduct.description,
      category: originalProduct.category,
      tags: [...originalProduct.tags],
      basePrice: originalProduct.basePrice,
      variants: JSON.parse(JSON.stringify(originalProduct.variants)), // Deep copy
      defaultPhoto: originalProduct.defaultPhoto, // We're referencing the same photo
      images: originalProduct.images.map(img => ({ ...img })), // Shallow copy of image objects
      inventory: originalProduct.inventory.map(inv => ({ ...inv })), // Shallow copy of inventory
      shippingDetails: { ...originalProduct.shippingDetails },
      seo: {
        ...originalProduct.seo,
        slug: newSlug,
        metaTitle: `Copy of ${originalProduct.seo.metaTitle}`,
        metaDescription: originalProduct.seo.metaDescription,
      },
      isActive: false, // Set the copied product as inactive by default
    };

    const newProduct = new Product(copiedProductData);
    await newProduct.save();

    logger.info('Product copied', { originalProductId: productId, newProductId: newProduct._id, copiedBy: req.user?.id });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};


export const getProductStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to view product statistics');
    }

    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ inventory: { $lt: 10 } });
    const outOfStockProducts = await Product.countDocuments({ inventory: 0 });

    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$price", "$inventory"] } }
        }
      }
    ]);

    const topSellingProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          productName: { $arrayElemAt: ["$productInfo.name", 0] }
        }
      }
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      inventoryValue: inventoryValue[0]?.totalValue || 0,
      topSellingProducts
    });
  } catch (error) {
    next(error);
  }
};