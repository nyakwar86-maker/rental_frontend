
// components/landlord/OfferForm.jsx
import React, { useState, useEffect } from 'react';
import { offerService } from '../../services/offer.service';
import { 
  XMarkIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  ClockIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const OfferForm = ({ 
  conversation,  // If you're passing conversation
  property,      // Or if you're passing property separately
  currentPrice,  // Current listing price
  onSubmit,      // Form submission handler
  onCancel,      // Cancel handler
  loading,       // Loading state
  landlordName   // Optional: landlord name for display
}) => {
  

  // Determine which source to use for property data
  const apartment = property || conversation?.apartment;
  const propertyPrice = currentPrice || apartment?.price || apartment?.rent_amount;

  console.log('OfferForm props:', { conversation, property, propertyPrice });
  
  
  const [formData, setFormData] = useState({
    amount: propertyPrice, // Using 'amount' to match your backend
    message: '', // Changed from 'terms' to 'message' for consistency
    lease_term: 12, // Default to 12 months
    expires_in_hours: 72
  });

console.log(' Form Data- ', formData);
  
  const [error, setError] = useState('');

  // Initialize form with current price if available
  useEffect(() => {
    if (propertyPrice && !formData.amount) {
      setFormData(prev => ({
        ...prev,
        amount: propertyPrice
      }));
    }
  }, [propertyPrice]);

  // Calculate commission (5%)
  const commission = formData.amount ? (formData.amount * 0.05).toFixed(2) : 0;
  
  // Calculate total
  const total = formData.amount ? (parseFloat(formData.amount) + parseFloat(commission)).toFixed(2) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(parseFloat(formData.amount))

    if (!formData.amount || formData.amount <= 0){
      console.log('Wrong rent amount');
    }
    
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid rent amount');
      return;
    }

    if (!formData.lease_term || formData.lease_term < 1) {
      setError('Please enter a valid lease term');
      return;
    }

    try {
      setError('');
      
      // Prepare offer data based on what your backend expects
      const offerData = {
        offered_rent: parseFloat(formData.amount),
        message: formData.message,
        lease_term: parseInt(formData.lease_term),
        expires_in_hours: parseInt(formData.expires_in_hours),
        // Add any additional fields your backend expects
      };

      // Call the onSubmit prop with the offer data
      await onSubmit(offerData);
      
    } catch (err) {
      setError(err.message || 'Failed to create offer');
      console.error('Offer submission error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format date for expiration
  const getExpirationDate = () => {
    if (!formData.expires_in_hours) return '';
    const hours = parseInt(formData.expires_in_hours);
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl mt-2">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">Make Rental Offer</h3>
          <div className="flex items-center mt-2">
            <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              {apartment ? (
                <>
                  <p className="text-sm font-medium text-gray-700">{apartment.title}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {apartment.address || 'Address not specified'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Property details</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          disabled={loading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Current Price Info */}
        {propertyPrice && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Current Listing Price:</span>
              <span className="text-lg font-bold text-blue-900">${propertyPrice}/month</span>
            </div>
          </div>
        )}

        {/* Rent Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
              Your Offer Amount (Monthly)
            </div>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">$</span>
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="1"
              step="0.01"
              required
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Enter your monthly rent offer
            </p>
            {propertyPrice && (
              <p className={`text-xs ${parseFloat(formData.amount || 0) < propertyPrice ? 'text-red-600' : 'text-green-600'}`}>
                {parseFloat(formData.amount || 0) < propertyPrice ? 'Below asking price' : 
                 parseFloat(formData.amount || 0) > propertyPrice ? 'Above asking price' : 
                 'At asking price'}
              </p>
            )}
          </div>
        </div>

        {/* Lease Term */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lease Term (Months)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[6, 12, 18, 24, 36].map(term => (
              <button
                key={term}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, lease_term: term }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  parseInt(formData.lease_term) === term
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {term} {term === 1 ? 'month' : 'months'}
              </button>
            ))}
            <div className="col-span-3 mt-2">
              <input
                type="number"
                name="lease_term"
                value={formData.lease_term}
                onChange={handleChange}
                min="1"
                max="60"
                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom months"
              />
            </div>
          </div>
        </div>

        {/* Message/Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              Message to Tenant (Optional)
            </div>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any special terms, conditions, or a personal message..."
            maxLength="500"
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              This helps tenants understand your offer better
            </p>
            <p className="text-xs text-gray-500">
              {formData.message.length}/500 characters
            </p>
          </div>
        </div>

        {/* Expiration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              Offer Expiration
            </div>
          </label>
          <select
            name="expires_in_hours"
            value={formData.expires_in_hours}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24">24 hours</option>
            <option value="48">48 hours</option>
            <option value="72">72 hours (3 days)</option>
            <option value="168">168 hours (7 days)</option>
            <option value="336">336 hours (14 days)</option>
            <option value="720">720 hours (30 days)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            This offer will expire on: <span className="font-medium">{getExpirationDate()}</span>
          </p>
        </div>

        {/* Offer Summary */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Offer Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="text-xs text-gray-500">Your proposed monthly payment</p>
              </div>
              <span className="text-lg font-bold text-gray-900">
                ${parseFloat(formData.amount || 0).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Lease Term</p>
                <p className="text-xs text-gray-500">Duration of agreement</p>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formData.lease_term} {formData.lease_term === 1 ? 'month' : 'months'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Rent</p>
                <p className="text-xs text-gray-500">Over entire lease term</p>
              </div>
              <span className="text-lg font-bold text-gray-900">
                ${(parseFloat(formData.amount || 0) * parseInt(formData.lease_term || 12)).toFixed(2)}
              </span>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Offer Expires</p>
                  <p className="text-xs text-gray-500">Tenant must respond by</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {getExpirationDate()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Note */}
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> A 5% commission (${commission}) will be added to the first month's payment. 
            This commission unlocks the property location and facilitates the rental agreement.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.amount}
            className={`px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
              loading || !formData.amount ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Offer...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                Make Offer
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;