import { Request, Response, NextFunction } from 'express';

import { AudioSample, IAudioSampleDocument } from '../models/audio-sample.model';
import DefaultAudioSample from '../models/audio-sample-default.model';
import UserAudioSample from '../models/audio-sample-user.model';
import Collection from '../models/collection.model';

import { deleteFileFromStorage } from '../utils/delete-file.util';
import { ValidationError, NotFoundError, InternalServerError, UnauthorizedError, MethodNotAllowedError, CustomError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

export const getMainPageSamples = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const samples = await DefaultAudioSample.find({ forMainPage: true });
    logger.debug('Main page samples retrieved', { count: samples.length });
    res.json(samples);
  } catch (error) {
    next(new InternalServerError('Error fetching main page samples'));
  }
};

export const getUserSamples = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const samples = await UserAudioSample.find({ user: req.user!.id });
    res.json(samples);
  } catch (error) {
    next(new InternalServerError('Error fetching user samples'));
  }
};


export const saveAudioSampleWithIcon = async (req: AuthRequestWithFiles, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new ValidationError('Sample name is required');
    }

    const isAdmin = req.user!.role === 'admin';
    
    if (!req.files || !Array.isArray(req.files) && (!req.files['audio'] || !req.files['icon'])) {
      throw new ValidationError('Both audio and icon files are required');
    }

    // Assuming req.files is not an array
    const audioFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['audio'][0];
    const iconFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['icon'][0];

    const audioUrl = `/uploads/audio/${isAdmin ? 'default' : 'user'}/${audioFile.filename}`;
    const iconUrl = `/uploads/icons/${isAdmin ? 'default' : 'user'}/${iconFile.filename}`;

    const AudioSampleModel = isAdmin ? DefaultAudioSample : UserAudioSample;

    const audioSample = new AudioSampleModel({
      ...(isAdmin ? {} : { user: req.user!._id }),
      name,
      audioUrl,
      iconUrl,
      ...(isAdmin ? { forMainPage: req.body.forMainPage === 'true' } : {})
    });

    await audioSample.save();
    logger.info('New audio sample with icon saved', { 
      sampleId: audioSample._id, 
      userId: req.user!._id, 
      isAdmin: req.user!.role === 'admin' 
    });
    res.status(201).json(audioSample);
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new InternalServerError('Error saving audio sample with icon'));
    }
  }
};

export const saveAudioSample = async (req: AuthRequestWithFile, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new ValidationError('Sample name is required');
    }

    const isAdmin = req.user!.role === 'admin';
    
    if (!req.file) {
      throw new ValidationError('Audio file is required');
    }

    const audioFile = req.file;

    const audioUrl = `/uploads/audio/${isAdmin ? 'default' : 'user'}/${audioFile.filename}`;

    const AudioSampleModel = isAdmin ? DefaultAudioSample : UserAudioSample;

    const audioSample = new AudioSampleModel({
      ...(isAdmin ? {} : { user: req.user!._id }),
      name,
      audioUrl,
      ...(isAdmin ? { forMainPage: req.body.forMainPage === 'true' } : {})
    });

    await audioSample.save();
    res.status(201).json(audioSample);
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new InternalServerError('Error saving audio sample'));
    }
  }
};

export const updateAudioSample = async (req: AuthRequestWithFile, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sampleId = req.params.id;
    const isAdmin = req.user!.role === 'admin';
    const { name } = req.body;
    const filter = isAdmin ? { _id: sampleId } : { _id: sampleId, user: req.user!._id };
    
    const update = {
      name,
      ...(isAdmin ? { forMainPage: req.body.forMainPage === 'true' } : {})
    };
    
    const updatedSample = await AudioSample.findOneAndUpdate(filter, update, { new: true });
    

    if (!updatedSample) {
      throw new NotFoundError('Audio sample');
    }

    res.json(updatedSample);
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new InternalServerError('Error updating audio sample'));
    }
  }
};

export const deleteAudioSample = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sampleId = req.params.id;
    const isAdmin = req.user!.role === 'admin';
    
    const sample = await AudioSample.findById(sampleId);
    
    if (!sample) {
      throw new NotFoundError('Audio sample');
    }

    if (sample.sampleType === 'DefaultAudioSample' && !isAdmin) {
      throw new MethodNotAllowedError('Default samples can only be deleted by admins');
    }

    // Use a type guard to check if the sample is a UserAudioSample
    if (sample.sampleType === 'UserAudioSample') {
      // Now TypeScript knows that sample is a UserAudioSample
      const userSample = sample as IAudioSampleDocument & { user: any };
      if (userSample.user.toString() !== req.user!._id.toString() && !isAdmin) {
        throw new UnauthorizedError('Not authorized to delete this audio sample');
      }
    }

    await AudioSample.findByIdAndDelete(sampleId);

    if (sample.sampleType === 'UserAudioSample') {
      await Collection.updateMany(
        { user: req.user!._id },
        { $pull: { samples: sampleId } }
      );
    } else if (isAdmin && sample.sampleType === 'DefaultAudioSample') {
      await Collection.updateMany(
        {},
        { $pull: { samples: sampleId } }
      );
    }

    await deleteFileFromStorage(sample.audioUrl);
    if (sample.iconUrl) {
      await deleteFileFromStorage(sample.iconUrl);
    }
    
    logger.info('Audio sample deleted', { 
      sampleId, 
      userId: req.user!._id, 
      isAdmin: req.user!.role === 'admin' 
    });
    res.json({ message: 'Sample deleted successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error deleting audio sample'));
  }
};