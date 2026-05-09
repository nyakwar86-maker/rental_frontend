const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (or use another service)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  // Upload single image
  static async uploadImage(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'rental-marketplace/apartments',
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      
      // Delete temp file
      fs.unlinkSync(file.path);
      
      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(files) {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  // Delete image
  static async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

module.exports = UploadService;