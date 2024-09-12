import { Response, NextFunction } from 'express';
import Collection from '../models/collection.model';
import { AudioSample, IAudioSampleDocument } from '../models/audio-sample.model';
import mongoose, { Types } from 'mongoose';
import { NotFoundError, UnauthorizedError, ValidationError, InternalServerError, CustomError, BadRequestError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const getUserCollections = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const collections = await Collection.find({ user: req.user!.id }).populate('samples');
    res.json(collections);
  } catch (error) {
    next(new InternalServerError('Error fetching user collections'));
  }
};

export const getCollectionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const userId = req.user!._id;

    const collection = await Collection.findOne({ _id: collectionId, user: userId }).populate('samples');
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    res.json(collection);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching collection'));
  }
};

interface CreateCollectionRequest extends AuthRequest {
  body: {
    name: string;
  };
}
  

export const createCollection = async (req: CreateCollectionRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new ValidationError('Collection name is required');
    }
    
    const newCollection = new Collection({
      user: req.user!.id,
      name
    });
    await newCollection.save();
    logger.info('New collection created', { collectionId: newCollection._id, userId: req.user!.id });
    res.status(201).json(newCollection);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating collection'));
  }
};

export const updateCollection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const userId = req.user!._id;
    const { name } = req.body;

    const updatedCollection = await Collection.findOneAndUpdate(
      { _id: collectionId, user: userId },
      { name },
      { new: true }
    );

    if (!updatedCollection) {
      throw new NotFoundError('Collection');
    }

    res.json(updatedCollection);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating collection'));
  }
};

interface AddToCollectionRequest extends AuthRequest {
  body: {
    sampleIds: string[];
  };
  params: {
    id: string;
  };
}


export const addToCollection = async (req: AddToCollectionRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sampleIds } = req.body;
    const userId = req.user!._id;

    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    // Check if the authenticated user owns the collection
    if (collection.user.toString() !== userId.toString()) {
      throw new UnauthorizedError('Not authorized to modify this collection');
    }

    // Ensure all sampleIds are valid ObjectIds
    if (!Array.isArray(sampleIds) || sampleIds.some(id => !Types.ObjectId.isValid(id))) {
      throw new BadRequestError('Invalid sample IDs');
    }
    
    
    
    // Find all samples in AudioSample (which includes both Default and User samples)
    const foundSamples = await AudioSample.find({
      _id: { $in: sampleIds },
      $or: [
        { sampleType: 'DefaultAudioSample' },
        { sampleType: 'UserAudioSample', user: userId } as any // by using any were telling ts to trust us
      ] // but tbh in UserAudioSample there is user field dumb dumb
    }).exec();

    // Explicitly type the foundSamples and map to _id
    // const typedFoundSamples = foundSamples as IAudioSampleDocument[];
    // const foundSampleIds: Types.ObjectId[] = typedFoundSamples.map(sample => sample._id);

    // Use a more aggressive type assertion
    const foundSampleIds = (foundSamples as IAudioSampleDocument[]).map(sample => sample._id) as Types.ObjectId[];


    const missingSamples = sampleIds.filter(id =>
      !foundSampleIds.some(foundId => foundId.equals(new Types.ObjectId(id)))
    );

    if (missingSamples.length > 0) {
      throw new NotFoundError(`One or more samples not found: ${missingSamples.join(', ')}`);
    }

    collection.samples.push(...foundSampleIds);
    await collection.save();

    logger.info('Samples added to collection', { 
      collectionId: collection._id, 
      userId: req.user!._id, 
      samplesAdded: foundSampleIds.length 
    });

    res.json(collection);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error adding to collection'));
  }
};

export const deleteCollection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const userId = req.user!._id;

    const deletedCollection = await Collection.findOneAndDelete({
      _id: collectionId,
      user: userId
    });

    if (!deletedCollection) {
      throw new NotFoundError('Collection');
    }

    logger.info('Collection deleted', { collectionId: deletedCollection._id, userId: req.user!._id });
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting collection'));
  }
};

export const removeFromCollection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collectionId, sampleId } = req.params;
    const userId = req.user!._id;

    const collection = await Collection.findOne({ _id: collectionId, user: userId });
    if (!collection) {
      throw new NotFoundError('Collection');
    }

    collection.samples = collection.samples.filter(sample => sample.toString() !== sampleId);
    await collection.save();

    res.json({ message: 'Sample removed from collection successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error removing sample from collection'));
  }
};