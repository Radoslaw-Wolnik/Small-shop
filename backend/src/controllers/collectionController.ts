import { Response } from 'express';
import Collection from '../models/Collection';
import { AudioSample, IAudioSampleDocument } from '../models/AudioSample';
import mongoose, { Types } from 'mongoose';

export const getUserCollections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collections = await Collection.find({ user: req.user!.id }).populate('samples');
    res.json(collections);
  } catch (error) {
    console.error('Error fetching user collections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCollectionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const userId = req.user!._id;

    const collection = await Collection.findOne({ _id: collectionId, user: userId }).populate('samples');
    if (!collection) {
      res.status(404).json({ message: 'Collection not found or not authorized to access' });
      return;
    }

    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface CreateCollectionRequest extends AuthRequest {
  body: {
    name: string;
  };
}
  

export const createCollection = async (req: CreateCollectionRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const newCollection = new Collection({
      user: req.user!.id,
      name
    });
    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCollection = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(404).json({ message: 'Collection not found or not authorized to update' });
      return;
    }

    res.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ message: 'Server error' });
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

export const addToCollection = async (req: AddToCollectionRequest, res: Response): Promise<void> => {
  try {
    const { sampleIds } = req.body;
    const userId = req.user!._id;

    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      res.status(404).json({ message: 'Collection not found' });
      return;
    }

    // Check if the authenticated user owns the collection
    if (collection.user.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to modify this collection' });
      return;
    }

    // Ensure all sampleIds are valid ObjectIds
    if (!Array.isArray(sampleIds) || sampleIds.some(id => !Types.ObjectId.isValid(id))) {
      res.status(400).json({ message: 'Invalid sample IDs' });
      return;
    }
    
    // Find all samples in AudioSample (which includes both Default and User samples)
    const foundSamples = await AudioSample.find({
      _id: { $in: sampleIds },
      $or: [
        { sampleType: 'DefaultAudioSample' },
        { sampleType: 'UserAudioSample', user: userId }
      ]
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
      res.status(404).json({ message: 'One or more samples not found', missingSamples });
      return;
    }

    collection.samples.push(...foundSampleIds);
    await collection.save();

    res.json(collection);
  } catch (error) {
    console.error('Error adding to collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collectionId = req.params.id;
    const userId = req.user!._id;

    const deletedCollection = await Collection.findOneAndDelete({
      _id: collectionId,
      user: userId
    });

    if (!deletedCollection) {
      res.status(404).json({ message: 'Collection not found or not authorized to delete' });
      return;
    }

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { collectionId, sampleId } = req.params;
    const userId = req.user!._id;

    const collection = await Collection.findOne({ _id: collectionId, user: userId });
    if (!collection) {
      res.status(404).json({ message: 'Collection not found or not authorized' });
      return;
    }

    collection.samples = collection.samples.filter(sample => sample.toString() !== sampleId);
    await collection.save();

    res.json({ message: 'Sample removed from collection successfully' });
  } catch (error) {
    console.error('Error removing sample from collection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};