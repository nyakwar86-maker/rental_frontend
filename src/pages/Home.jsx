import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiMapPin, FiDollarSign, FiMessageSquare } from 'react-icons/fi';

import supabase from '../config/supabaseClient';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  console.log(supabase)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Rental Home
          </h1>
          <p className="text-xl mb-8">
            Connect with landlords, negotiate deals, and secure your dream apartment
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <a
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHome className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Listings</h3>
              <p className="text-gray-600">Find apartments that match your needs and budget</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat Directly</h3>
              <p className="text-gray-600">Communicate directly with landlords in real-time</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="text-2xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Pay commission securely through our platform</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Location</h3>
              <p className="text-gray-600">Receive exact location after commission payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.full_name || user?.email}!</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-lg mb-4">You are logged in as: <span className="font-semibold capitalize">{user?.role}</span></p>
              <div className="space-y-2">
                <p>Email: {user?.email}</p>
                <p>Status: {user?.is_verified ? 'Verified ✓' : 'Not verified'}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;