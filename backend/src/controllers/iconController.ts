import { Response } from 'express';
import UserAudioSample from '../models/UserAudioSample';
import DefaultAudioSample from '../models/DefaultAudioSample';
import fs from 'fs/promises';
import path from 'path';

  
export const saveIconToStorage = async (req: AuthRequestWithFile, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
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
    console.error('Error saving icon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const updateIcon = async (req: AuthRequestWithFile, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Icon file is required' });
      return;
    }

    const audioSampleId = req.params.id;
    const isAdmin = req.user && req.user.role === 'admin';
    
    let audioSample;
    if (isAdmin) {
      audioSample = await DefaultAudioSample.findById(audioSampleId);
    } else {
      audioSample = await UserAudioSample.findById(audioSampleId);
    }

    if (!audioSample) {
      res.status(404).json({ message: 'Audio sample not found' });
      return;
    }

    // Delete the old icon if it exists
    if (audioSample.iconUrl) {
      const oldIconPath = path.join(__dirname, '..', audioSample.iconUrl);
      await fs.unlink(oldIconPath).catch(err => console.error('Error deleting old icon:', err));
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
  
    res.status(200).json(updatedAudioSample);
  } catch (error) {
    console.error('Error updating audio sample icon:', error);
    res.status(500).json({ message: 'Error updating audio sample icon' });
  }
};