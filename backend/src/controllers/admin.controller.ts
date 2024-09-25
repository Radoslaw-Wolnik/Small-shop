import { Response, NextFunction } from 'express';
import User from '../models/user.model';
import EmailTemplate from '../models/email-template.model';
import Product from '../models/product.model';
import { NotFoundError, BadRequestError, InternalServerError, ValidationError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import { sanitizeData } from '../utils/sanitize.util';

export const getAdmins = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    logger.info('Admin list retrieved', { userId: req.user?.id, count: admins.length });
    res.json(sanitizeData(admins));
  } catch (error) {
    next(new InternalServerError('Error fetching admins'));
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    logger.info('All users list retrieved', { userId: req.user?.id, count: users.length });
    res.json(sanitizeData(users));
  } catch (error) {
    next(new InternalServerError('Error fetching all users'));
  }
};

export const deleteAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedAdmin = await User.findOneAndDelete({ _id: id, role: 'admin' });
    if (!deletedAdmin) {
      throw new NotFoundError('Admin');
    }
    logger.warn('Admin account deleted', { deletedAdminId: id, deletedBy: req.user?.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof NotFoundError ? error : new InternalServerError('Error deleting admin'));
  }
};

export const addAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      throw new ValidationError('Username, password, and email are required');
    }

    const newAdmin = new User({
      username,
      email,
      password,
      role: 'admin'
    });
    await newAdmin.save();
    logger.info('New admin account created', { newAdminId: newAdmin._id, createdBy: req.user?.id });

    const { password: _, ...adminWithoutPassword } = newAdmin.toObject();
    res.status(201).json(sanitizeData(adminWithoutPassword));
  } catch (error) {
    next(error instanceof ValidationError ? error : new InternalServerError('Error adding admin'));
  }
};

export const updateEmailTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, subject, body, variables } = req.body;

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(id, 
      { name, subject, body, variables },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      throw new NotFoundError('Email template');
    }

    logger.info('Email template updated', { templateId: id, updatedBy: req.user?.id });
    res.json(updatedTemplate);
  } catch (error) {
    next(error instanceof NotFoundError ? error : new InternalServerError('Error updating email template'));
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!deletedProduct) {
      throw new NotFoundError('Product');
    }
    // Remove product from all wishlists
    await User.updateMany(
      { wishlist: id },
      { $pull: { wishlist: id } }
    );
    logger.info('Product deleted and removed from wishlists', { productId: id, deletedBy: req.user?.id });
    res.status(204).send();
  } catch (error) {
    next(error instanceof NotFoundError ? error : new InternalServerError('Error deleting product'));
  }
};

export const deleteInactiveUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({ lastTimeActive: { $lt: thirtyDaysAgo }, role: { $ne: 'admin' } });
    logger.info('Inactive users deleted', { count: result.deletedCount, deletedBy: req.user?.id });
    res.json({ message: `${result.deletedCount} inactive users deleted` });
  } catch (error) {
    next(new InternalServerError('Error deleting inactive users'));
  }
};

export const updateSensitiveData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, newEmail, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (newEmail) {
      user.email = newEmail;
      user.isVerified = false; // Require re-verification for new email
    }

    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();
    logger.info('Sensitive data updated', { userId, updatedBy: req.user?.id });
    res.json({ message: 'Sensitive data updated successfully' });
  } catch (error) {
    next(error instanceof NotFoundError ? error : new InternalServerError('Error updating sensitive data'));
  }
};