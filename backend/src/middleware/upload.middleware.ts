import multer from 'multer';
import path from 'path';
import { 
  audioStorage, 
  iconStorage, 
  profilePictureStorage, 
  audioFileFilter, 
  iconFileFilter, 
  pictureFileFilter
} from './multer.middleware';


const createMulterUpload = (storage: multer.StorageEngine, fileFilter: multer.Options['fileFilter'], maxSize: number) => 
  multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).single('file');

export const uploadProfilePicture = createMulterUpload(profilePictureStorage, pictureFileFilter, 5 * 1024 * 1024);
export const uploadAudio = createMulterUpload(audioStorage, audioFileFilter, 10 * 1024 * 1024);
export const uploadIcon = createMulterUpload(iconStorage, iconFileFilter, 2 * 1024 * 1024);

export const uploadAudioAndIcon = multer({
  storage: multer.diskStorage({
    destination: (req: AuthRequestWithFiles, file: Express.Multer.File, cb) => {
      const isAdmin = req.user && req.user.role === 'admin';
      let uploadPath = 'uploads/';
      uploadPath += file.fieldname === 'audio' ? 'audio/' : 'icons/';
      uploadPath += isAdmin ? 'default/' : 'user/';
      cb(null, uploadPath);
    },
    filename: (req: AuthRequestWithFiles, file: Express.Multer.File, cb) => {
      const userId = req.user ? req.user._id : 'default';
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${file.fieldname}-${userId}-${timestamp}${ext}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      audioFileFilter(req, file, cb);
    } else if (file.fieldname === 'icon') {
      iconFileFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]);
