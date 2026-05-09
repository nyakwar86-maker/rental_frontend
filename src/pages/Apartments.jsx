
import React, { useState, useEffect, useCallback } from 'react';
import { apartmentService } from '../services/apartment.service';
import { getApartmentsFirstImages } from '../services/image.service'; // Add this import
import ApartmentCard from '../components/apartment/ApartmentCard';
import { 
  FiSearch, 
  FiFilter, 
  FiMapPin, 
  FiChevronDown,
  FiHome,
  FiPlus,
  FiLoader
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [apartmentImages, setApartmentImages] = useState({}); // Store images separately
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false); // Track image loading separately
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    status: 'available'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  // Fetch apartments and their images
  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apartmentService.getAllApartments();
      setApartments(data.apartments || []);
      
      // Fetch images for these apartments
      await fetchApartmentImages(data.apartments || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch images for apartments
  const fetchApartmentImages = async (apartmentList) => {
    if (!apartmentList || apartmentList.length === 0) return;
    
    try {
      setImageLoading(true);
      const apartmentIds = apartmentList.map(apt => apt.id);
      const imagesMap = await getApartmentsFirstImages(apartmentIds);
      setApartmentImages(imagesMap);
      
      
    } catch (error) {
      console.error('Error fetching apartment images:', error);
      // Don't fail the entire page if images fail
      setApartmentImages({});
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.status) params.status = filters.status;
      
      const data = await apartmentService.getAllApartments(params);
      setApartments(data.apartments || []);
      
      // Fetch images for search results
      await fetchApartmentImages(data.apartments || []);
    } catch (error) {
      console.error('Error searching apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      status: 'available'
    });
    setSearchQuery('');
    fetchApartments();
  };

  // Loading skeleton - updated to show image placeholders
  if (loading && apartments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton height={40} width={300} className="mb-4" />
          <Skeleton height={20} width={400} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
              <Skeleton height={192} className="mb-0" />
              <div className="p-6">
                <Skeleton height={24} width="80%" className="mb-2" />
                <Skeleton height={16} width="60%" className="mb-4" />
                <Skeleton height={20} width="40%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header - unchanged */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Apartments</h1>
            <p className="text-gray-600 mt-2">Find your perfect rental home</p>
          </div>
          
          {user?.role === 'landlord' && (
            <Link
              to="/apartments/create"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              <span>List Property</span>
            </Link>
          )}
        </div>

        {/* Search Bar - unchanged */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, neighborhood, or address..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 mt-4 hover:text-blue-600"
          >
            <FiFilter />
            <span>Filters</span>
            <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="$0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="$5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Updated to show image loading */}
      {loading ? (
        <div className="text-center py-12">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading apartments...</p>
        </div>
      ) : apartments.length > 0 ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-700">
              Found <span className="font-semibold">{apartments.length}</span> apartments
              {imageLoading && (
                <span className="ml-2 text-sm text-blue-600">
                  <FiLoader className="inline animate-spin mr-1" size={14} />
                  Loading images...
                </span>
              )}
            </p>
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Bedrooms</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <ApartmentCard 
                key={apartment.id} 
                apartment={apartment}
                preloadedImage={apartmentImages[apartment.id]} // Pass preloaded image
                isLandlordView={user?.role === 'landlord'}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FiHome className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No apartments found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search filters or check back later for new listings.
          </p>
          <button
            onClick={resetFilters}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
    
      )}
    </div>
  );
};

export default Apartments;


