import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

class CloudinaryService {
  constructor() {
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        logger.warn('⚠️  Cloudinary not configured. Image uploads will use local storage.');
        return;
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      logger.info('☁️  Cloudinary service initialized');
    } catch (error) {
      logger.error('Failed to initialize Cloudinary:', error);
    }
  }

  async uploadImage(filePath, folder = 'ai-nexus') {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1920, height: 1080, crop: 'limit' }
        ]
      });

      logger.info(`☁️  Image uploaded to Cloudinary: ${result.public_id}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadBuffer(buffer, folder = 'ai-nexus', options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ],
            ...options
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary buffer upload error:', error);
              reject(error);
            } else {
              logger.info(`☁️  Buffer uploaded to Cloudinary: ${result.public_id}`);
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
              });
            }
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      logger.error('Cloudinary buffer upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        logger.info(`☁️  Image deleted from Cloudinary: ${publicId}`);
        return { success: true };
      } else {
        logger.warn(`⚠️  Failed to delete image from Cloudinary: ${publicId}`);
        return { success: false, message: 'Image not found or already deleted' };
      }
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getImageUrl(publicId, transformations = {}) {
    try {
      return cloudinary.url(publicId, {
        secure: true,
        ...transformations
      });
    } catch (error) {
      logger.error('Cloudinary URL generation error:', error);
      return null;
    }
  }

  generateThumbnail(publicId) {
    return this.getImageUrl(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }
}

// Export singleton instance
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
