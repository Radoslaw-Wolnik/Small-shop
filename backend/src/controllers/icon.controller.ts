import { Response, NextFunction } from 'express';
import UserAudioSample from '../models/audio-sample-user.model';
import DefaultAudioSample from '../models/audio-sample-default.model';
import { deleteFileFromStorage } from '../utils/delete-file.util';
import { ValidationError, NotFoundError, InternalServerError, UnauthorizedError, CustomError } from '../utils/custom-errors.util';

  
export const saveIconToStorage = async (req: AuthRequestWithFile, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }
  
    const isAdmin = req.user && req.user.role === 'admin';
    // const relativePath = `/uploads/icons/${req.file.filename}`;
    const relativePath = `/uploads/icons/${isAdmin ? 'default' : 'user'}/${req.file.filename}`;
    
    // Save the icon file information to your database here
    res.json({
      message: 'Icon uploaded successfully',
      iconPath: relativePath
    });
  } catch (error) {
    if (req.file) {
      await deleteFileFromStorage(req.file.path);
    }
    next(error instanceof CustomError ? error : new InternalServerError('Error saving icon'));
  }
};



export const updateIcon = async (req: AuthRequestWithFile, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new ValidationError('Icon file is required');
    }

    if (!req.user) {
      throw new UnauthorizedError('User not authenticated'); // will never happen
    }

    const audioSampleId = req.params.id;
    const isAdmin = req.user.role === 'admin';
    
    let audioSample;
    if (isAdmin) {
      audioSample = await DefaultAudioSample.findById(audioSampleId);
    } else {
      audioSample = await UserAudioSample.findOne({ _id: audioSampleId, user: req.user!._id });
    }

    if (!audioSample) {
      throw new NotFoundError('Audio sample');
    }

    if (!isAdmin) {
      if (!('user' in audioSample) || audioSample.user.toString() !== req.user._id.toString()) {
        throw new UnauthorizedError('Not authorized to update this audio sample');
      }
    }
    
    // Delete the old icon if it exists
    if (audioSample.iconUrl) {
      await deleteFileFromStorage(audioSample.iconUrl);
    }

    const iconUrl = `/uploads/icons/${isAdmin ? 'default' : 'user'}/${req.file.filename}`;
  
    let updatedAudioSample;
    if (isAdmin) {
      updatedAudioSample = await DefaultAudioSample.findByIdAndUpdate(
        audioSampleId,
        { iconUrl: iconUrl },
        { new: true }
      );
    } else {
      updatedAudioSample = await UserAudioSample.findByIdAndUpdate(
        audioSampleId,
        { iconUrl: iconUrl },
        { new: true }
      );
    }

    if (!updatedAudioSample) {
      throw new NotFoundError('Audio sample');
    }
  
    res.status(200).json(updatedAudioSample);
  } catch (error) {
    if (req.file) {
      await deleteFileFromStorage(req.file.path);
    }
    next(error instanceof CustomError ? error : new InternalServerError('Error updating audio sample icon'));
  }
};