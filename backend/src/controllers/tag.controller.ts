import { Request, Response, NextFunction } from 'express';
import Tag from '../models/tag.model';
import Product from '../models/product.model';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createTag = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to create tags');
    }

    const { name } = req.body;
    const tag = new Tag({ name });
    await tag.save();

    logger.info('Tag created', { tagId: tag._id, createdBy: req.user.id });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to update tags');
    }

    const { id } = req.params;
    const { name } = req.body;
    const tag = await Tag.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    logger.info('Tag updated', { tagId: id, updatedBy: req.user.id });
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to delete tags');
    }

    const { id } = req.params;
    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    // Remove the tag from all products
    await Product.updateMany({ tags: id }, { $pull: { tags: id } });

    logger.info('Tag deleted', { tagId: id, deletedBy: req.user.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

export const getTagById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tag = await Tag.findById(id);

    if (!tag) {
      throw new NotFoundError('Tag');
    }

    res.json(tag);
  } catch (error) {
    next(error);
  }
};

export const getProductsByTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const products = await Product.find({ tags: id }).populate('category');

    res.json(products);
  } catch (error) {
    next(error);
  }
};