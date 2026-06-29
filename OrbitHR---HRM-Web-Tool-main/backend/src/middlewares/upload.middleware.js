import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const uploadsRoot = path.resolve(currentDir, '..', '..', 'uploads');

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Unsupported file type');
      error.statusCode = 400;
      return cb(error);
    }
    return cb(null, true);
  },
});

export const documentUploadRoot = uploadsRoot;
