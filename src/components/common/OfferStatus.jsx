
// components/common/OfferStatus.jsx
import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const OfferStatus = ({ offer, userRole }) => {
  const getStatusConfig = () => {
    switch (offer.status) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          title: 'Offer Pending',
          description: userRole === 'landlord' 
            ? 'Waiting for tenant response' 
            : 'You have a new rental offer to review'
        };
      case 'accepted':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          title: 'Offer Accepted',
          description: userRole === 'landlord'
            ? 'Tenant accepted the offer. Awaiting commission payment.'
            : 'You accepted the offer. Proceed to pay commission.'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          title: 'Offer Rejected',
          description: offer.notes || 'The offer was rejected'
        };
      case 'expired':
        return {
          icon: ExclamationTriangleIcon,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          title: 'Offer Expired',
          description: 'This offer has expired'
        };
      case 'withdrawn':
        return {
          icon: ArrowPathIcon,
          color: 'blue',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          title: 'Offer Withdrawn',
          description: 'The landlord withdrew this offer'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Check if commission is paid
  const isCommissionPaid = offer.commission_paid;

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.textColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-2 text-sm ${config.textColor}`}>
            <p>{config.description}</p>
            
            {/* Offer Details */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Offered Rent:</span>
                <span className="font-semibold">${offer.offered_rent}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission (5%):</span>
                <span className="font-semibold">${offer.commission_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-semibold">
                  {new Date(offer.expires_at).toLocaleString()}
                </span>
              </div>
              
              {/* Commission Status */}
              {offer.status === 'accepted' && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission:</span>
                    <span className={`font-semibold ${isCommissionPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isCommissionPaid ? 'Paid' : 'Pending Payment'}
                    </span>
                  </div>
                  {!isCommissionPaid && userRole === 'tenant' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pay commission to unlock property location
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferStatus;