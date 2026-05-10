import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX,
  FiHome, FiCheckCircle, FiAlertCircle, FiLock 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      
      setProfile(response.data.user);
      setFormData({
        full_name: response.data.user.full_name || '',
        phone: response.data.user.phone || '',
        avatar_url: response.data.user.avatar_url || ''
      });
      
      // Fetch user-specific stats
      if (response.data.user.role === 'landlord') {
        fetchLandlordStats();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlordStats = async () => {
    try {
      const response = await api.get('/users/landlord/stats');
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
        fetchUserProfile(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const response = await changePassword(passwordData);
      // toast.success(response.message || 'Password changed successfully');
      console.log(response);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      // toast.error(error.response?.data?.error );
      console.log(error)
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Skeleton height={40} width={200} className="mb-6" />
          <div className="space-y-4">
            <Skeleton height={20} width={150} />
            <Skeleton height={40} />
            <Skeleton height={20} width={150} />
            <Skeleton height={40} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiEdit2 />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FiSave />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        avatar_url: profile.avatar_url || ''
                      });
                    }}
                    className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <FiX />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                  <p className="text-gray-600">{profile?.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {profile?.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <FiUser className="text-gray-400" />
                      <span>{profile?.full_name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <FiMail className="text-gray-400" />
                    <span>{profile?.email}</span>
                    {profile?.is_verified && (
                      <FiCheckCircle className="text-green-500" title="Verified" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <FiPhone className="text-gray-400" />
                      <span>{profile?.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900 capitalize">
                    <FiHome className="text-gray-400" />
                    <span>{profile?.role}</span>
                  </div>
                </div>
              </div>

              {/* Stats for Landlords */}
              {userStats && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Total Listings</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.total_listings || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Available</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.available_listings || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Occupied</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.occupied_listings || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600">Verification</p>
                      <p className="text-2xl font-bold text-gray-900">{profile?.is_verified ? '✓' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Security</h2>
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <FiLock />
                  <span>Change Password</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>

            {showPasswordForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {!showPasswordForm && (
              <p className="text-gray-600">
                For security, please change your password regularly. Use a strong password with at least 8 characters.
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Verification</span>
                <span className={`px-3 py-1 rounded-full text-sm ${profile?.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {profile?.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Type</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                  {profile?.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Member Since</span>
                <span className="text-sm">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {profile?.role === 'landlord' && (
                <a
                  href="/apartments/create"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  + Add New Listing
                </a>
              )}
              <a
                href="/apartments"
                className="block w-full text-center border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition"
              >
                Browse Listings
              </a>
              <button
                onClick={logout}
                className="block w-full text-center border border-red-600 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you need assistance with your account or have questions about our platform, please contact support.
            </p>
            <a
              href="mailto:support@rentalmarket.com"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;