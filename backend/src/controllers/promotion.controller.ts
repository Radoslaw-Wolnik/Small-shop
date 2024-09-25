import { Request, Response, NextFunction } from 'express';
import PromotionCode from '../models/promotion-code.model';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createPromotion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to create promotions');
    }

    const { code, discountType, discountValue, validFrom, validUntil, usageLimit } = req.body;
    const promotion = new PromotionCode({
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit
    });

    await promotion.save();
    logger.info('Promotion created', { promotionId: promotion._id, createdBy: req.user.id });
    res.status(201).json(promotion);
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to update promotions');
    }

    const { id } = req.params;
    const updateData = req.body;
    const promotion = await PromotionCode.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!promotion) {
      throw new NotFoundError('Promotion');
    }

    logger.info('Promotion updated', { promotionId: id, updatedBy: req.user.id });
    res.json(promotion);
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to delete promotions');
    }

    const { id } = req.params;
    const promotion = await PromotionCode.findByIdAndDelete(id);
    if (!promotion) {
      throw new NotFoundError('Promotion');
    }

    logger.info('Promotion deleted', { promotionId: id, deletedBy: req.user.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listPromotions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to view promotions');
    }

    const promotions = await PromotionCode.find();
    logger.info('Promotions list retrieved', { count: promotions.length, retrievedBy: req.user.id });
    res.json(promotions);
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.params;
    const promotion = await PromotionCode.findOne({ 
      code, 
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      isActive: true
    });

    if (!promotion) {
      throw new NotFoundError('Valid promotion not found');
    }

    if (promotion.usageLimit > 0 && promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestError('Promotion usage limit reached');
    }

    res.json({ 
      valid: true, 
      discountType: promotion.discountType, 
      discountValue: promotion.discountValue 
    });
  } catch (error) {
    next(error);
  }
};

export const applyPromotion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, orderId } = req.body;
    const promotion = await PromotionCode.findOne({ 
      code, 
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      isActive: true
    });

    if (!promotion) {
      throw new NotFoundError('Valid promotion not found');
    }

    if (promotion.usageLimit > 0 && promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestError('Promotion usage limit reached');
    }

    // Here you would typically apply the promotion to the order
    // This is a simplified example
    promotion.usageCount += 1;
    await promotion.save();

    logger.info('Promotion applied to order', { promotionId: promotion._id, orderId, appliedBy: req.user?.id });
    res.json({ message: 'Promotion applied successfully' });
  } catch (error) {
    next(error);
  }
};