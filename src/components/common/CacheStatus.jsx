
import React, { useState, useEffect } from 'react';
import { FiDatabase, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import cacheService from '../../services/cache.service';

const CacheStatus = () => {
  const [stats, setStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const cacheStats = cacheService.getStats();
    setStats(cacheStats);
  };

  const clearCache = () => {
    if (window.confirm('Clear all cached data? This will force reload from server.')) {
      cacheService.clear();
      updateStats();
      window.location.reload();
    }
  };

  const clearExpired = () => {
    cacheService.clearExpired();
    updateStats();
  };

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showDetails ? (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-2 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Cache Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cached Items:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Size:</span>
              <span className="font-medium">{stats.sizeMB} MB</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={clearExpired}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 mb-2"
              >
                <FiRefreshCw size={14} />
                <span>Clear Expired</span>
              </button>
              
              <button
                onClick={clearCache}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
              >
                <FiTrash2 size={14} />
                <span>Clear All Cache</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowDetails(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Cache Status"
        >
          <FiDatabase size={20} />
        </button>
      )}
    </div>
  );
};

export default CacheStatus;