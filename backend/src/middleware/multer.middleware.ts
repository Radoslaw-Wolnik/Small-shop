import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Import Multer's FileFilterCallback type
import { FileFilterCallback } from 'multer';

import { FileTypeNotAllowedError, FileSizeTooLargeError, BadRequestError } from '../utils/custom-errors.util';


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

export const audioStorage = createStorage('audio');
export const iconStorage = createStorage('icons');
export const profilePictureStorage = createStorage('profile-picture', false);

const createFileFilter = (allowedTypes: RegExp, errorMessage: string) => 
  (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new FileTypeNotAllowedError([...allowedTypes.source.matchAll(/\w+/g)].map(m => m[0])));
    }
  };

export const audioFileFilter = createFileFilter(/wav|mp3|ogg/, "File upload only supports audio files (wav, mp3, ogg)");
export const iconFileFilter = createFileFilter(/png/, "File upload only supports images (png)");
export const pictureFileFilter = createFileFilter(/jpeg|jpg|png|gif/, "File upload only supports image files (jpeg, jpg, png, gif)");


export const handleMulterError = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSize = (err.field === 'audio' || err.field === 'icon') ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
      next(new FileSizeTooLargeError(maxSize));
    } else {
      next(new BadRequestError(err.message));
    }
  } else if (err instanceof Error) {
    next(err);
  } else {
    next(new BadRequestError('Unknown error during file upload'));
  }
};

// A utility to wrap Multer middleware and handle errors
export const multerErrorHandler = (multerMiddleware: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: any) => {
      if (err) {
        next(err);  // Pass the error to the next middleware (your custom error handler)
      } else {
        next();  // No errors, continue to the next middleware
      }
    });
  };
};