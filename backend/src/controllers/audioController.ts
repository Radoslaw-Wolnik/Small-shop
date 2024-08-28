import { Request, Response } from 'express';

import { AudioSample } from '../models/AudioSample';
import DefaultAudioSample from '../models/DefaultAudioSample';
import UserAudioSample from '../models/UserAudioSample';
import Collection from '../models/Collection';

import { deleteFileFromStorage } from '../utils/deleteFile';

export const getMainPageSamples = async (_req: Request, res: Response): Promise<void> => {
  try {
    const samples = await DefaultAudioSample.find({ forMainPage: true });
    res.json(samples);
  } catch (error) {
    console.error('Error fetching main page samples:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSamples = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const samples = await UserAudioSample.find({ user: req.user!.id });
    res.json(samples);
  } catch (error) {
    console.error('Error fetching user samples:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const saveAudioSampleWithIcon = async (req: AuthRequestWithFiles, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const isAdmin = req.user!.role === 'admin';
    
    if (!req.files || !Array.isArray(req.files) && (!req.files['audio'] || !req.files['icon'])) {
      res.status(400).json({ message: 'Both audio and icon files are required' });
      return;
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
    res.status(201).json(audioSample);
  } catch (error) {
    console.error('Error saving audio sample with icon:', error);
    res.status(500).json({ message: 'Error saving audio sample with icon' });
  }
};

export const saveAudioSample = async (req: AuthRequestWithFile, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const isAdmin = req.user!.role === 'admin';
    
    if (!req.file) {
      res.status(400).json({ message: 'Audio file is required' });
      return;
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
    console.error('Error saving audio sample:', error);
    res.status(500).json({ message: 'Error saving audio sample' });
  }
};

export const updateAudioSample = async (req: AuthRequestWithFile, res: Response): Promise<void> => {
  try {
    const sampleId = req.params.id;
    const isAdmin = req.user!.role === 'admin';
    const { name } = req.body;

    const updatedSample = await AudioSample.findOneAndUpdate(
      isAdmin ? { _id: sampleId } : { _id: sampleId, user: req.user!._id },
      { 
        name, 
        ...(isAdmin ? { forMainPage: req.body.forMainPage === 'true' } : {}) 
      },
      { new: true }
    );

    if (!updatedSample) {
      res.status(404).json({ message: 'Sample not found or not authorized to update' });
      return;
    }

    res.json(updatedSample);
  } catch (error) {
    console.error('Error updating audio sample:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAudioSample = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sampleId = req.params.id;
    const isAdmin = req.user!.role === 'admin';

    const deletedSample = await AudioSample.findOneAndDelete(
      isAdmin ? { _id: sampleId } : { _id: sampleId, user: req.user!._id }
    );

    if (!deletedSample) {
      res.status(404).json({ message: 'Sample not found or not authorized to delete' });
      return;
    }

    if (deletedSample.sampleType === 'UserAudioSample') {
      await Collection.updateMany(
        { user: req.user!._id },
        { $pull: { samples: sampleId } }
      );
    } else if (isAdmin && deletedSample.sampleType === 'DefaultAudioSample') {
      await Collection.updateMany(
        {},
        { $pull: { samples: sampleId } }
      );
    }

    await deleteFileFromStorage(deletedSample.audioUrl);
    if (deletedSample.iconUrl) {
      await deleteFileFromStorage(deletedSample.iconUrl);
    }

    res.json({ message: 'Sample deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio sample:', error);
    res.status(500).json({ message: 'Server error' });
  }
};