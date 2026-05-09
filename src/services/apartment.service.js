import api from './api';
import cacheService from './cache.service';

export const apartmentService = {
  // Get all apartments with caching
  getAllApartments: async (params = {}, forceRefresh = false) => {
    const cacheKey = `apartments_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('📄 Returning cached apartments');
        return cached;
      }
    }

    try {
      console.log('🌐 Fetching apartments from server');
      const response = await api.get('/apartments', { params });
      const data = response.data;

      // Extract apartments array from response structure
      const apartments = data.data?.apartments || data.apartments || [];

      const result = {
        apartments,
        pagination: data.data?.pagination || data.pagination || {},
        success: data.success || true
      };

      // Cache the response for 2 minutes
      cacheService.set(cacheKey, result, cacheService.defaultTTL.apartments);

      // Also cache individual apartments
      if (apartments && Array.isArray(apartments)) {
        apartments.forEach(apartment => {
          cacheService.set(`apartment_${apartment.id}`, apartment, cacheService.defaultTTL.apartment);
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching apartments:', error);

      // Return cached data if available (even if expired for fallback)
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('🔄 Using expired cache as fallback');
        return cached;
      }

      throw error;
    }
  },

  // Advanced search with multiple filters
  searchApartments: async (filters = {}, forceRefresh = false) => {
    // Create cache key based on filters
    const filterString = JSON.stringify(filters);
    const cacheKey = `apartments_search_${filterString}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('📄 Returning cached search results');
        return cached;
      }
    }

    try {
      console.log('🔍 Searching apartments with filters:', filters);
      const response = await api.get('/apartments/search', { params: filters });

      // Extract data from response structure
      const data = response.data;
      const apartments = data.data?.apartments || data.apartments || [];

      const result = {
        apartments,
        pagination: data.data?.pagination || data.pagination || {},
        success: data.success || true
      };

      // Cache for 1 minute (search results change more frequently)
      cacheService.set(cacheKey, result, 60 * 1000);

      return result;
    } catch (error) {
      console.error('❌ Error searching apartments:', error);

      // Return cached data if available
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('🔄 Using expired cache as fallback for search');
        return cached;
      }

      throw error;
    }
  },

  // Get available filters with caching
  getAvailableFilters: async (forceRefresh = false) => {
    const cacheKey = 'available_filters';

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('📄 Returning cached filters');
        return cached;
      }
    }

    try {
      console.log('🌐 Fetching available filters from server');
      const response = await api.get('/apartments/filters/available');
      const data = response.data;

      console.log(data);


      // Extract filters from response structure
      const filters = {
        cities: data.data?.cities || data.cities || [],
        neighborhoods: data.data?.neighborhoods || data.neighborhoods || [],
        apartmentTypes: ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'],
        amenities: data.data?.amenities || data.amenities || []
      };

      // Cache for 30 minutes (filters don't change often)
      cacheService.set(cacheKey, filters, 30 * 60 * 1000);

      return filters;
    } catch (error) {
      console.error('❌ Error fetching filters:', error);

      // Return default filters as fallback
      const defaultFilters = {
        cities: [],
        neighborhoods: [],
        apartmentTypes: ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'],
        amenities: []
      };

      return defaultFilters;
    }
  },

  // Get single apartment with caching
  getApartment: async (id, forceRefresh = false) => {
    const cacheKey = `apartment_${id}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`📄 Returning cached apartment: ${id}`);
        return cached;
      }
    }

    try {
      console.log(`🌐 Fetching apartment ${id} from server`);
      const response = await api.get(`/apartments/${id}`);
      const data = response.data;

      // Extract apartment data from response structure

      const apartment = data.data || data;

      // Cache for 10 minutes
      cacheService.set(cacheKey, apartment, cacheService.defaultTTL.apartment);

      return apartment;
    } catch (error) {
      console.error(`❌ Error fetching apartment ${id}:`, error);

      // Fallback to cache
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`🔄 Using expired cache as fallback for apartment ${id}`);
        return cached;
      }

      throw error;
    }
  },

  // Get landlord's own apartments
  getMyApartments: async (params = {}, forceRefresh = false) => {
    const cacheKey = `my_apartments_${JSON.stringify(params)}`;

    if (!forceRefresh) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('📄 Returning cached my apartments');
        return cached;
      }
    }

    try {
      console.log('🌐 Fetching my apartments from server');
      const response = await api.get('/apartments/landlord/my-apartments', { params });
      const data = response.data;

      const apartments = data.data?.apartments || data.apartments || [];

      const result = {
        apartments,
        pagination: data.data?.pagination || data.pagination || {},
        success: data.success || true
      };

      // Cache for 1 minute
      cacheService.set(cacheKey, result, 60 * 1000);

      return result;
    } catch (error) {
      console.error('❌ Error fetching my apartments:', error);

      // Return cached data if available
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log('🔄 Using expired cache as fallback for my apartments');
        return cached;
      }

      throw error;
    }
  },

  // Create apartment (clears cache)
  createApartment: async (apartmentData) => {
    try {
      const response = await api.post('/apartments', apartmentData);

      // Clear relevant cache
      apartmentService.clearApartmentCache();

      return response.data;
    } catch (error) {
      console.error('❌ Error creating apartment:', error);
      throw error;
    }
  },

  // Update apartment (clears cache)
  updateApartment: async (id, apartmentData) => {
    try {
      const response = await api.put(`/apartments/${id}`, apartmentData);

      // Clear cache for this apartment and lists
      apartmentService.clearApartmentCache(id);

      return response.data;
    } catch (error) {
      console.error('❌ Error updating apartment:', error);
      throw error;
    }
  },

  // Delete apartment (clears cache)
  deleteApartment: async (id) => {
    try {
      const response = await api.delete(`/apartments/${id}`);

      // Clear relevant cache
      apartmentService.clearApartmentCache(id);

      return response.data;
    } catch (error) {
      console.error('❌ Error deleting apartment:', error);
      throw error;
    }
  },

  // Clear apartment cache
  clearApartmentCache: (id = null) => {
    if (id) {
      cacheService.remove(`apartment_${id}`);
      console.log(`🗑️ Cleared cache for apartment: ${id}`);
    } else {
      // Clear all apartment-related cache
      const keys = cacheService.getAllKeys();
      keys.forEach(key => {
        if (key.includes('apartment') || key.includes('apartments_search')) {
          cacheService.remove(key.replace('rental-app_', ''));
        }
      });
      console.log('🗑️ Cleared all apartment cache');
    }
  },

  // Clear filter cache
  clearFilterCache: () => {
    cacheService.remove('available_filters');
    console.log('🗑️ Cleared filter cache');
  },

  // Force refresh apartment data
  refreshApartment: async (id) => {
    return await apartmentService.getApartment(id, true);
  },

  // Force refresh all apartments
  refreshAllApartments: async (params = {}) => {
    return await apartmentService.getAllApartments(params, true);
  },

  // Get cache info for debugging
  getCacheInfo: (id = null) => {
    if (id) {
      return cacheService.getInfo(`apartment_${id}`);
    }
    return cacheService.getStats();
  }
};