
// components/tenant/OfferActions.jsx
import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CurrencyDollarIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { offerService } from '../../services/offer.service';
import socketService from '../../services/socket.service';

const OfferActions = ({ offer, conversationId, user, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if offer is expired
  const isExpired = new Date() > new Date(offer.expires_at);
  const isAccepted = offer.status === 'accepted';
  const isPending = offer.status === 'pending';
  const isCommissionPaid = offer.commission_paid;

  // Handle accept offer
  const handleAcceptOffer = async () => {

      console.log("conversation Id");
    
      console.log(conversationId);
    if (isExpired) {
      setError('This offer has expired');
      return;
    }

    if (!window.confirm(`Are you sure you want to accept this offer for $${offer.offered_rent}/month?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await offerService.acceptOffer(conversationId);
      
      
      
      if (response.success) {
        // Update local state
        onStatusChange?.(response.data.offer);
        
        // Socket notification
        socketService.sendOfferEvent('offer_accepted', {
          conversationId,
          offer: response.data.offer
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject offer
  const handleRejectOffer = async () => {
    if (isExpired) {
      setError('This offer has expired');
      return;
    }

    if (!rejectReason.trim() && !window.confirm('Reject without providing a reason?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await offerService.rejectOffer(conversationId, rejectReason);
      
      if (response.success) {
        // Update local state
        onStatusChange?.(response.data.offer);
        
        // Close modal
        setShowRejectModal(false);
        setRejectReason('');
        
        // Socket notification
        socketService.sendOfferEvent('offer_rejected', {
          conversationId,
          offer: response.data.offer,
          reason: rejectReason
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to reject offer');
    } finally {
      setLoading(false);
    }
  };

  // Handle commission payment
  const handlePayCommission = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await offerService.payCommission(conversationId);
      
      if (response.success) {
        // Update local state
        onStatusChange?.(response.data.offer);
        
        // Close modal
        setShowPaymentModal(false);
        
        // Socket notification
        socketService.sendOfferEvent('commission_paid', {
          conversationId,
          offer: response.data.offer
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(offer.expires_at);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
    return `${diffMinutes}m remaining`;
  };

  // Render based on offer status
  if (isExpired && offer.status === 'pending') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Offer Expired</h3>
            <p className="text-sm text-red-600 mt-1">
              This offer expired on {new Date(offer.expires_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAccepted && !isCommissionPaid) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Commission Payment Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Pay the commission fee to unlock the exact property location and complete the rental agreement.
              </p>
              
              <div className="mt-3 bg-white p-3 rounded border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Commission Amount (5%):</span>
                  <span className="font-semibold">${offer.commission_amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold">${offer.offered_rent}</span>
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total First Payment:</span>
                    <span className="text-blue-600">
                      ${(parseFloat(offer.offered_rent) + parseFloat(offer.commission_amount)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Rent + Commission (commission unlocks location)
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={loading}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Pay Commission Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Commission</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to pay the commission fee of <span className="font-semibold">${offer.commission_amount}</span>. 
                    This will unlock the exact property location and confirm your rental agreement.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Commission Fee:</span>
                        <span className="font-medium">${offer.commission_amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total:</span>
                          <span className="text-blue-600">${offer.commission_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayCommission}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">New Rental Offer</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You have received a rental offer. Please accept or reject before it expires.
                  </p>
                </div>
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-xs font-medium text-blue-600">
                    {getTimeRemaining()}
                  </span>
                </div>
              </div>
              
              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleAcceptOffer}
                  disabled={loading}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Accept Offer'}
                </button>
                
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject Offer
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>
                  <strong>Note:</strong> If you accept, you'll need to pay a commission fee of ${offer.commission_amount} 
                  (5% of first month's rent) to unlock the exact property location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Offer Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Offer</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to reject this offer for ${offer.offered_rent}/month?
                  Providing a reason is optional but helpful for the landlord.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection (optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Price is too high, location doesn't work for me..."
                    maxLength="500"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {rejectReason.length}/500 characters
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectOffer}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Reject Offer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (isAccepted && isCommissionPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Commission Paid</h3>
            <p className="text-sm text-green-600 mt-1">
              Commission paid on {new Date(offer.commission_paid_at).toLocaleDateString()}. 
              The landlord can now share the exact property location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For other statuses (rejected, withdrawn, cancelled)
  return null;
};

export default OfferActions;