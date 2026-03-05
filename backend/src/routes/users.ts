/**
 * OpenWave — Users Routes
 */
import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/users.controller';
import { defaultUser } from '../middleware/defaultUser.middleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = process.env.LOCAL_UPLOAD_PATH || path.join(__dirname, '../../uploads');

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(UPLOADS_DIR, 'avatars')),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

export const usersRouter = Router();

usersRouter.use(defaultUser);
usersRouter.get('/:id', getProfile);
usersRouter.patch('/:id', updateProfile);
usersRouter.post('/:id/avatar', avatarUpload.single('avatar'), uploadAvatar);
