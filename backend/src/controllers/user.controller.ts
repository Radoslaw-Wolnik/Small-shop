import { NextFunction, Request, Response } from 'express';
import path from 'path';

import User from '../models/user.model';
import { ValidationError, UnauthorizedError, NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';
import { deleteFileFromStorage } from '../utils/delete-file.util';
import logger from '../utils/logger.util';

export const getUserOwnProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // create new object without the password
    const userWithoutPassword = req.user.toObject();
    delete userWithoutPassword.password;

    userWithoutPassword.email = await req.user.getDecryptedEmail();

    logger.debug('User retrieved own profile', { userId: req.user!._id });
    res.json(userWithoutPassword);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching user profile'));
  }
};

export const saveProfilePicture = async (req: AuthRequestWithFile, res: Response, next: NextFunction): Promise<void> => {
  try {
    // i would like to delete this becouse we have already checked that based on the authToken middleware before in routes
    // but i need it - othervise ts error
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated'); // will never happen
    }

    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // If user already has a profile picture, delete the old one
    if (req.user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', req.user.profilePicture);
      await deleteFileFromStorage(oldPicturePath)
    }

    // The file is already uploaded by the middleware, so we just need to save the path
    const relativePath = `/uploads/profile-picture/${req.user.id}/${req.file.filename}`;
    req.user.profilePicture = relativePath;
    await req.user.save();

    logger.info('User updated profile picture', { userId: req.user!._id });
    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: relativePath
    });
  } catch (error) {
    if (req.file) {
      await deleteFileFromStorage(req.file.path);
    }
    next(error instanceof CustomError ? error : new InternalServerError('Error saving profile picture'));
  }
};


export const getOtherUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      throw new NotFoundError('User');
    }
    res.json(user);
  }  catch (error) {
    // console.error('Error fetching user profile:', error);
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching user profile'));
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!updatedUser) {
      throw new NotFoundError('User');
    }

    logger.info('User profile updated', { userId: req.user._id });
    res.json(updatedUser);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating user profile'));
  }
};


export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: req.body.productId } },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    logger.info('Product added to wishlist', { userId: req.user._id, productId: req.body.productId });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    logger.info('Product removed from wishlist', { userId: req.user._id, productId: req.params.productId });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const addShippingInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('User');
    }

    user.shippingAddresses.push(req.body);
    await user.save();

    logger.info('Shipping info added', { userId: req.user._id });
    res.json(user.shippingAddresses);
  } catch (error) {
    next(error);
  }
};

export const updateShippingInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const addressIndex = user.shippingAddresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) {
      throw new NotFoundError('Shipping address');
    }

    user.shippingAddresses[addressIndex] = { ...user.shippingAddresses[addressIndex], ...req.body };
    await user.save();

    logger.info('Shipping info updated', { userId: req.user._id, addressId: req.params.id });
    res.json(user.shippingAddresses[addressIndex]);
  } catch (error) {
    next(error);
  }
};


export const updateLastActiveTime = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    req.user.lastTimeActive = new Date();
    await req.user.save();

    res.json({ message: 'Last active time updated successfully' });
  } catch (error) {
    next(error);
  }
};
