// backend/src/routes/uploadRoutes.ts
import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { protect, adminOnly, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Configure Multer to process files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any, false);
    }
  }
});

// Helper function to upload a buffer via a stream to Cloudinary
const uploadFromBuffer = (fileBuffer: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    // Set up the Cloudinary stream upload
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dunia_epharma' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          return resolve(result);
        }
        reject(new Error('Upload failed'));
      }
    );

    // End the stream by writing the buffer data directly to it
    stream.end(fileBuffer);
  });
};

// The Upload Endpoint
router.post(
  '/upload',
  [protect as any, adminOnly as any, upload.single('image')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file uploaded' });
        return;
      }

      // RUNTIME EVALUATION: Configure Cloudinary dynamically inside the request handler
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Stream the binary buffer directly to Cloudinary (No Base64 overhead!)
      const result = await uploadFromBuffer(req.file.buffer);

      res.status(200).json({
        message: 'Image uploaded successfully!',
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error('❌ Cloudinary Upload Error details:', error);
      res.status(500).json({ message: 'Cloud upload failed', error });
    }
  }
);

export default router;