import { Request, Response, NextFunction } from 'express';
import Address from '../models/address.model'; // idk why err here
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const createAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { label, street, city, state, country, zipCode } = req.body;
    const address = new Address({
      user: req.user._id,
      label,
      street,
      city,
      state,
      country,
      zipCode
    });

    await address.save();
    logger.info('Address created', { addressId: address._id, userId: req.user._id });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = req.params;
    const updateData = req.body;
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!address) {
      throw new NotFoundError('Address');
    }

    logger.info('Address updated', { addressId: id, userId: req.user._id });
    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

    if (!address) {
      throw new NotFoundError('Address');
    }

    logger.info('Address deleted', { addressId: id, userId: req.user._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
      throw new NotFoundError('Address');
    }

    res.json(address);
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = req.params;

    // Remove default status from all other addresses
    await Address.updateMany({ user: req.user._id }, { isDefault: false });

    // Set the specified address as default
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      throw new NotFoundError('Address');
    }

    logger.info('Default address set', { addressId: id, userId: req.user._id });
    res.json(address);
  } catch (error) {
    next(error);
  }
};