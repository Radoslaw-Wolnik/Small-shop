import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Import Multer's FileFilterCallback type
import { FileFilterCallback } from 'multer';


// Define a more specific type for the callback function
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;


const createStorage = (baseDir: string, useUserSubfolder: boolean = true) => multer.diskStorage({
  destination: (req: AuthRequestWithFile, file: Express.Multer.File, cb: DestinationCallback) => {
    const isAdmin = req.user && req.user.role === 'admin';
    let uploadPath = `uploads/${baseDir}/`;
    if (useUserSubfolder) {
      uploadPath += isAdmin ? 'default/' : 'user/';
    }
    cb(null, uploadPath);
  },
  filename: (req: AuthRequestWithFile, file: Express.Multer.File, cb: FileNameCallback) => {
    const userId = req.user ? req.user._id : 'default';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${baseDir}-${userId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

const audioStorage = createStorage('audio');
const iconStorage = createStorage('icons');
const profilePictureStorage = createStorage('profile-picture', false);


export const audioFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /wav|mp3|ogg/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Error: File upload only supports audio files (wav, mp3, ogg)"));
  }
};

export const iconFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Error: File upload only supports images (png)"));
  }
};

const pictureFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Error: File upload only supports audio files (wav, mp3, ogg)"));
  }
};


const audioUpload = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const iconUpload = multer({
  storage: iconStorage,
  fileFilter: iconFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: pictureFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadProfilePicture = profilePictureUpload.single('profilePicture');
export const uploadAudio = audioUpload.single('audio');
export const uploadIcon = iconUpload.single('icon');

// Import the combined upload middleware
export { uploadAudioAndIcon } from './uploadCombined';