

import api from './api';
import cacheService from './cache.service';

// Helper to ensure full URL
export function ensureFullUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
  const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  const imagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${baseUrl}${imagePath}`;
}

// Main service object
const imageService = {

  // Get apartment images with caching
  getApartmentImages: async (apartmentId, forceRefresh = false) => {
    const cacheKey = `images_${apartmentId}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`📄 Returning cached images for apartment: ${apartmentId}`);
        return cached;
      }
    }

    try {
      console.log(`🌐 Fetching images for apartment: ${apartmentId}`);
      const response = await api.get(`/apartments/${apartmentId}/images`);
      
      let images = [];
      if (response.data?.images) {
        images = response.data.images;
        
      } else if (response.data.data) {
        images = response.data.data;
      } else if (Array.isArray(response.data)) {
        images = response.data;
      }

      const processedImages = images.map((img, index) => {
        const imageObj = {
          id: img.id || img.public_id || `img-${index}`,
          url: ensureFullUrl(img.url || img.secure_url || img.image_url),
          thumbnail: ensureFullUrl(img.thumbnail || img.url || img.secure_url),
          is_primary: img.is_primary || img.isPrimary || false,
          original_name: img.original_name || img.originalName,
          size: img.size,
          created_at: img.created_at || img.createdAt
        };
        return imageObj;
      }).filter(img => img.url);

      const result = {
        images: processedImages,
        count: processedImages.length
      };

      // Cache for 5 minutes
      cacheService.set(cacheKey, result, cacheService.defaultTTL.images);

      return result;
    } catch (error) {
      console.error('❌ Error fetching images:', error);

      // Return cached data if available
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('🔄 Using expired cache as fallback for images');
        return cached;
      }

      if (error.response?.status === 404) {
        const emptyResult = { images: [], count: 0 };
        cacheService.set(cacheKey, emptyResult, cacheService.defaultTTL.images);
        return emptyResult;
      }

      throw error;
    }
  },

  // Get first image for a single apartment with caching
  getApartmentFirstImage: async (apartmentId, forceRefresh = false) => {
    const cacheKey = `first_image_${apartmentId}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    try {
      const result = await imageService.getApartmentImages(apartmentId, forceRefresh);
      const firstImage = result.images.length > 0 ? result.images[0].url : null;
      

      // Cache the first image URL
      cacheService.set(cacheKey, firstImage, cacheService.defaultTTL.images);

      return firstImage;
    } catch (error) {
      console.error(`❌ Error getting first image for apartment ${apartmentId}:`, error);
      return null;
    }
  },

  // Get first images for multiple apartments (bulk) with caching
  getApartmentsFirstImages: async (apartmentIds, forceRefresh = false) => {
    if (!apartmentIds || apartmentIds.length === 0) {
      return {};
    }

    // Sort IDs for consistent cache key
    const sortedIds = [...apartmentIds].sort();
    const cacheKey = `bulk_images_${sortedIds.join('_')}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`📄 Returning cached bulk images for ${apartmentIds.length} apartments`);
        return cached;
      }
    }

    console.log(`🌐 Bulk fetching first images for ${apartmentIds.length} apartments`);

    const imagePromises = apartmentIds.map(async (apartmentId) => {
      try {
        const firstImage = await imageService.getApartmentFirstImage(apartmentId, forceRefresh);
        return { apartmentId, firstImage };
      } catch (error) {
        console.error(`Failed to get image for apartment ${apartmentId}:`, error);
        return { apartmentId, firstImage: null };
      }
    });

    const results = await Promise.all(imagePromises);

    const imagesMap = results.reduce((acc, { apartmentId, firstImage }) => {
      acc[apartmentId] = firstImage;
      return acc;
    }, {});

    // Cache bulk results for 5 minutes
    cacheService.set(cacheKey, imagesMap, cacheService.defaultTTL.images);

    console.log('✅ Retrieved first images for apartments');
    return imagesMap;
  },

  // Clear image cache
  clearImageCache: (apartmentId = null) => {
    if (apartmentId) {
      cacheService.remove(`images_${apartmentId}`);
      cacheService.remove(`first_image_${apartmentId}`);
      console.log(`🗑️ Cleared image cache for apartment: ${apartmentId}`);
    } else {
      // Clear all image-related cache
      const keys = cacheService.getAllKeys();
      keys.forEach(key => {
        if (key.includes('images') || key.includes('first_image') || key.includes('bulk_images')) {
          cacheService.remove(key.replace('rental-app_', ''));
        }
      });
      console.log('🗑️ Cleared all image cache');
    }
  },

  // Upload images (clears cache)
  uploadImages: async (apartmentId, imageFiles) => {
    try {
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await api.post(`/apartments/${apartmentId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const images = response.data.data?.images || response.data.data || [];
      const processedImages = images.map(img => ({
        ...img,
        url: ensureFullUrl(img.url),
        thumbnail: img.thumbnail ? ensureFullUrl(img.thumbnail) : ensureFullUrl(img.url)
      }));

      // Clear image cache for this apartment
      imageService.clearImageCache(apartmentId);

      return {
        ...response.data.data,
        images: processedImages
      };
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      throw error;
    }
  },

  // Set primary image (clears cache)
  setPrimaryImage: async (apartmentId, imageId) => {
    try {
      const response = await api.put(`/apartments/${apartmentId}/images/${imageId}/set-primary`);

      const images = response.data.data?.images || [];
      const processedImages = images.map(img => ({
        ...img,
        url: ensureFullUrl(img.url),
        thumbnail: img.thumbnail ? ensureFullUrl(img.thumbnail) : ensureFullUrl(img.url)
      }));

      // Clear image cache
      imageService.clearImageCache(apartmentId);

      return {
        ...response.data.data,
        images: processedImages
      };
    } catch (error) {
      console.error('❌ Error setting primary image:', error);
      throw error;
    }
  },

  // Delete image (clears cache)
  deleteImage: async (apartmentId, imageId) => {
    try {
      const response = await api.delete(`/apartments/${apartmentId}/images/${imageId}`);

      const images = response.data.data?.images || [];
      const processedImages = images.map(img => ({
        ...img,
        url: ensureFullUrl(img.url),
        thumbnail: img.thumbnail ? ensureFullUrl(img.thumbnail) : ensureFullUrl(img.url)
      }));

      // Clear image cache
      imageService.clearImageCache(apartmentId);

      return {
        ...response.data.data,
        images: processedImages
      };
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  },

  // Reorder images
  reorderImages: async (apartmentId, imageIds) => {
    try {
      const response = await api.put(`/apartments/${apartmentId}/images/reorder`, {
        imageIds
      });

      const images = response.data.data?.images || [];
      const processedImages = images.map(img => ({
        ...img,
        url: ensureFullUrl(img.url),
        thumbnail: img.thumbnail ? ensureFullUrl(img.thumbnail) : ensureFullUrl(img.url)
      }));

      // Clear image cache
      imageService.clearImageCache(apartmentId);

      return {
        ...response.data.data,
        images: processedImages
      };
    } catch (error) {
      console.error('❌ Error reordering images:', error);
      throw error;
    }
  },

  // Force refresh images
  refreshApartmentImages: async (apartmentId) => {
    return await imageService.getApartmentImages(apartmentId, true);
  },

  // Test image URL (utility function)
  testImageUrl: async (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ valid: true, url });
      img.onerror = () => resolve({ valid: false, url });
      img.src = url;
    });
  },

  // Get all image URLs from apartment (including fallbacks)
  getAllImageUrls: (apartment) => {
    const urls = [];

    // Add from images array
    if (apartment.images && Array.isArray(apartment.images)) {
      apartment.images.forEach(img => {
        const url = ensureFullUrl(img.url || img);
        if (url) urls.push(url);
      });
    }

    // Add main_image
    if (apartment.main_image) {
      const url = ensureFullUrl(apartment.main_image);
      if (url && !urls.includes(url)) urls.push(url);
    }

    // Add any other image fields
    if (apartment.image_url) {
      const url = ensureFullUrl(apartment.image_url);
      if (url && !urls.includes(url)) urls.push(url);
    }

    return urls;
  },

  // Get placeholder image URL for different scenarios
  getPlaceholderImage: (type = 'apartment') => {
    const placeholders = {
      apartment: `https://via.placeholder.com/400x300?text=Apartment+Image`,
      profile: `https://via.placeholder.com/200x200?text=Profile`,
      building: `https://via.placeholder.com/400x300?text=Building`,
      default: `https://via.placeholder.com/400x300?text=No+Image`
    };

    return placeholders[type] || placeholders.default;
  },

  // Create a data URL for image preview before upload
  createImagePreview: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  // Validate image file
  validateImageFile: (file) => {
    const errors = [];

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      errors.push(`File size must be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jfif', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not supported. Please use JPG, PNG, or WebP.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Upload images with progress tracking
  uploadImagesWithProgress: async (apartmentId, files, onProgress) => {
    try {
      console.log('📤 Uploading images for apartment:', apartmentId);
      console.log('📁 Image files:', files);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await api.post(`/apartments/${apartmentId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      console.log('✅ Upload response:', response.data);

      // Process and return images with full URLs
      const images = response.data.data?.images || response.data.data || [];
      console.log(images);

      const processedImages = images.map(img => ({
        ...img,
        url: ensureFullUrl(img.url),
        thumbnail: img.thumbnail ? ensureFullUrl(img.thumbnail) : ensureFullUrl(img.url)
      }));

      return {
        ...response.data.data,
        images: processedImages
      };
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      console.error('🔍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export default imageService;
// Export the main service object as default


// Also export individual functions for easier imports
export const getApartmentImages = imageService.getApartmentImages;
export const getApartmentFirstImage = imageService.getApartmentFirstImage;
export const getApartmentsFirstImages = imageService.getApartmentsFirstImages;
export const clearImageCache = imageService.clearImageCache;
export const refreshApartmentImages = imageService.refreshApartmentImages;
export const getPlaceholderImage = imageService.getPlaceholderImage;
export const createImagePreview = imageService.createImagePreview;
export const validateImageFile = imageService.validateImageFile;
export const uploadImgs = imageService.uploadImages;
export const uploadImages_WithProgress = imageService.uploadImagesWithProgress;
export const deleteImage = imageService.deleteImage;

