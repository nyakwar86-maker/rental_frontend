import React, { useState, useEffect, useCallback } from 'react';
import { apartmentService } from '../services/apartment.service';
import { getApartmentsFirstImages } from '../services/image.service';
import ApartmentCard from '../components/apartment/ApartmentCard';

import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown,
  FiHome,
  FiPlus,
  FiLoader,
  FiRefreshCw,
  FiX,
  FiEdit2,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '..//context/AuthContext';
import Skeleton from 'react-loading-skeleton';

const MyListings = () => {
  const [apartments, setApartments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [apartmentImages, setApartmentImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    unavailable: 0,
    pending: 0,
    totalRevenue: 0
  });

  const fetchMyListings = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        search: searchQuery || undefined
      };

      const data = await apartmentService.getMyApartments(params, forceRefresh);
      
      setApartments(data.apartments || []);
      setPagination(data.pagination || {});
      
      // Fetch images for these apartments
      await fetchApartmentImages(data.apartments || [], forceRefresh);
      
      // Calculate stats
      calculateStats(data.apartments || []);
      
    } catch (error) {
      console.error('Error fetching my listings:', error);
      setApartments([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  const fetchApartmentImages = async (apartmentList, forceRefresh = false) => {
    if (!apartmentList || apartmentList.length === 0) return;
    
    try {
      setImageLoading(true);
      const apartmentIds = apartmentList.map(apt => apt.id);
      const imagesMap = await getApartmentsFirstImages(apartmentIds, forceRefresh);
      setApartmentImages(imagesMap);
    } catch (error) {
      console.error('Error fetching apartment images:', error);
      setApartmentImages({});
    } finally {
      setImageLoading(false);
    }
  };

  const calculateStats = (apartmentsList) => {
    const stats = {
      total: apartmentsList.length,
      available: 0,
      occupied: 0,
      unavailable: 0,
      pending: 0,
      totalRevenue: 0
    };

    apartmentsList.forEach(apartment => {
      // Count by status
      if (apartment.status === 'available') stats.available++;
      else if (apartment.status === 'occupied') stats.occupied++;
      else if (apartment.status === 'unavailable') stats.unavailable++;
      else if (apartment.status === 'pending') stats.pending++;
      
      // Calculate revenue (only for occupied apartments)
      if (apartment.status === 'occupied' && apartment.rent_amount) {
        stats.totalRevenue += parseFloat(apartment.rent_amount);
      }
    });

    setStats(stats);
  };

  useEffect(() => {
    if (user?.role === 'landlord') {
      fetchMyListings();
    } else {
      navigate('/apartments');
    }
  }, [fetchMyListings, user, navigate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  const refreshData = async () => {
    await fetchMyListings(true);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading skeleton
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">Manage your apartment listings</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              title="Refresh listings"
            >
              <FiRefreshCw className={imageLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <Link
              to="/apartments/create"
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              <span>Add New Listing</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiHome className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiUser className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiDollarSign className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your listings..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && fetchMyListings()}
                />
              </div>
            </div>
            
            <button
              onClick={() => fetchMyListings()}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="text-center py-12">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      ) : apartments.length > 0 ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                Showing <span className="font-semibold">{apartments.length}</span> of your listings
                {pagination.total > apartments.length && ` (${pagination.total} total)`}
              </p>
              {imageLoading && (
                <span className="ml-2 text-sm text-blue-600">
                  <FiLoader className="inline animate-spin mr-1" size={14} />
                  Loading images...
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <div key={apartment.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Image Section */}
                <div className="h-48 relative overflow-hidden">
                  {apartmentImages[apartment.id] ? (
                    <img
                      src={apartmentImages[apartment.id]}
                      alt={apartment.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FiHome className="text-4xl text-gray-400" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apartment.status)}`}>
                      {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Created date */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
                    <FiCalendar className="inline mr-1" size={10} />
                    {new Date(apartment.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {apartment.title}
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      ${apartment.rent_amount?.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal">/month</span>
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <FiHome className="mr-2" />
                    <span>
                      {apartment.city}, {apartment.neighborhood}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-gray-700">
                      <span className="font-medium">{apartment.bedrooms || 'N/A'} bed</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">{apartment.bathrooms || 'N/A'} bath</span>
                    </div>
                    {apartment.square_feet && (
                      <div className="text-gray-700">
                        <span className="font-medium">{apartment.square_feet.toLocaleString()} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/apartments/${apartment.id}`}
                          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                          title="View Details"
                        >
                          <FiEye size={16} />
                          <span className="text-sm">View</span>
                        </Link>
                        
                        <Link
                          to={`/apartments/${apartment.id}/edit`}
                          className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                          title="Edit Listing"
                        >
                          <FiEdit2 size={16} />
                          <span className="text-sm">Edit</span>
                        </Link>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <FiClock className="inline mr-1" size={12} />
                        Last updated: {new Date(apartment.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`px-4 py-2.5 rounded-lg transition-colors ${
                      pagination.page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {pagination.pages > 5 && (
                  <span className="px-3 text-gray-500">...</span>
                )}
                <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <FiHome className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filters.status 
              ? 'Try adjusting your search filters' 
              : "You haven't created any apartment listings yet"}
          </p>
          {(searchQuery || filters.status) ? (
            <button
              onClick={resetFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          ) : (
            <Link
              to="/apartments/create"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              <FiPlus />
              <span>Create Your First Listing</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MyListings;