import { Request, Response, NextFunction } from 'express';
import { upload, handleMulterError } from './multer.middleware';

export const uploadProfilePicture = (req: Request, res: Response, next: NextFunction) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      next();
    }
  });
};

export const uploadProductPictures = (req: Request, res: Response, next: NextFunction) => {
  upload.array('productPictures', 5)(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      next();
    }
  });
};