import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { audioFileFilter, iconFileFilter } from './upload';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;


const createCombinedStorage = () => multer.diskStorage({
  destination: (req: AuthRequestWithFiles, file: Express.Multer.File, cb: DestinationCallback) => {
    const isAdmin = req.user && req.user.role === 'admin';
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'audio') {
      uploadPath += 'audio/';
    } else if (file.fieldname === 'icon') {
      uploadPath += 'icons/';
    }
    
    uploadPath += isAdmin ? 'default/' : 'user/';
    cb(null, uploadPath);
  },
  filename: (req: AuthRequestWithFiles, file: Express.Multer.File, cb: FileNameCallback) => {
    const userId = req.user ? req.user._id : 'default';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${userId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});


const combinedFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.fieldname === 'audio') {
      audioFileFilter(req, file, cb);
    } else if (file.fieldname === 'icon') {
      iconFileFilter(req, file, cb);
    } else {
      cb(new Error("Invalid file field"));
    }
};

export const uploadAudioAndIcon = multer({
  storage: createCombinedStorage(),
  fileFilter: combinedFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]);