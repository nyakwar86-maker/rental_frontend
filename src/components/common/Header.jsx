import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext'; // ADD THIS
import {
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiUser,
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useChat(); // GET UNREAD COUNT
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <FiHome className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Rental<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${isActive('/')}`}
            >
              Home
            </Link>

            <Link
              to="/apartments"
              className={`px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${isActive('/apartments')}`}
            >
              Browse
            </Link>

            {isAuthenticated && (
              <>
                {/* <Link
                  to="/conversations"
                  className={`px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1 ${isActive('/conversations')}`}
                >
                  <FiMessageSquare />
                  <span>Messages</span>
                </Link> */}

                <Link to="/chat" className="messages-link">
                  <FiMessageSquare  className="text-gray-600 "/>
                  {unreadCount > 0 && (
                     <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1 ${isActive('/profile')}`}
                >
                  <FiUser />
                  <span>Profile</span>
                </Link>

                {/* Add this link for landlords */}
                {user?.role === 'landlord' && (
                  <Link
                    to="/landlord/listings"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  >
                    <FiHome size={18} />
                    <span>My Listings</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard">Admin</Link>
                )}

              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Messages */}
                {unreadCount > 0 && (
                  <p className="text-xs text-blue-500 capitalize">{unreadCount} New {unreadCount == 1 ? "Message" : "Messages"}</p>
                  )
                }
                <Link to="/chat" className="hidden md:block p-2 rounded-full hover:bg-gray-100 relative">
                  <FiMessageSquare className="text-gray-600" />
                  {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
               
                {/* Notifications */}
                <button className="hidden md:block p-2 rounded-full hover:bg-gray-100 relative">
                  <FiBell className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>

                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <FiLogOut />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg ${isActive('/')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/apartments"
                className={`px-4 py-3 rounded-lg ${isActive('/apartments')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Apartments
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/conversations"
                    className={`px-4 py-3 rounded-lg ${isActive('/conversations')}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>

                  <Link
                    to="/profile"
                    className={`px-4 py-3 rounded-lg ${isActive('/profile')}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 px-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.full_name || user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;