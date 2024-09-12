import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Import Multer's FileFilterCallback type
import { FileFilterCallback } from 'multer';

import { FileTypeNotAllowedError, FileSizeTooLargeError, BadRequestError } from '../utils/custom-errors.util';


// Define a more specific type for the callback function
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;


const storage = multer.diskStorage({
  destination: (req: AuthRequestWithFile, file: Express.Multer.File, cb: DestinationCallback) => {
    let uploadPath: string;

    if (file.fieldname === 'profilePicture') {
      uploadPath = 'uploads/profile_pictures/';
    } else if (file.fieldname === 'productPictures') {
      const productName = req.body.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      uploadPath = `uploads/product_pictures/${productName}/`;
    } else {
      return cb(new Error('Invalid field name'), '');
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: AuthRequestWithFile, file: Express.Multer.File, cb: FileNameCallback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new FileTypeNotAllowedError(['jpeg', 'png', 'gif']));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  }
});

export const handleMulterError = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new FileSizeTooLargeError(5 * 1024 * 1024));
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