import { Request, Response } from 'express';
import User, { IUserDocument } from '../models/User';
import fs from 'fs/promises';
import path from 'path';


export const getUserOwnProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log("backend is trying");
  //console.log('data: ', req.user);
  
  if (!req.user) {
    res.status(500).json({ message: 'Internal server error: User not attached to request' });
    return;
  }

  // Create a new object without the password
  const userWithoutPassword = req.user.toObject();
  delete userWithoutPassword.password;

  res.json(userWithoutPassword);

};

export const saveProfilePicture = async (req: AuthRequestWithFile, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(500).json({ message: 'Internal server error: User not attached to request' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // If user already has a profile picture, delete the old one
    if (req.user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', req.user.profilePicture);
      await fs.unlink(oldPicturePath).catch(err => console.error('Error deleting old profile picture:', err));
    }

    // The file is already uploaded by the middleware, so we just need to save the path
    const relativePath = `/uploads/profile-picture/${req.file.filename}`;
    req.user.profilePicture = relativePath;
    await req.user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: relativePath
    });
  } catch (error) {
    console.error('Error saving profile picture:', error);
    // If an error occurs, attempt to delete the uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting uploaded file:', err));
    }
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};


export const getOtherUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};