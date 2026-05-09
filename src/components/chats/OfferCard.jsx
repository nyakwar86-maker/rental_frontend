
import React from 'react';
import { conversationService } from '../services/conversation.service';

const OfferCard = ({ offer, userRole, conversationId }) => {
  const isLandlord = userRole === 'landlord';
  const isTenant = userRole === 'tenant';
  
  const handleAcceptOffer = async () => {
    if (window.confirm('Are you sure you want to accept this offer?')) {
      try {
        await conversationService.acceptOffer(conversationId);
        alert('Offer accepted! Please proceed with commission payment.');
      } catch (error) {
        alert('Failed to accept offer: ' + error.message);
      }
    }
  };

  const handleRejectOffer = async () => {
    if (window.confirm('Are you sure you want to reject this offer?')) {
      try {
        await conversationService.rejectOffer(conversationId);
        alert('Offer rejected.');
      } catch (error) {
        alert('Failed to reject offer: ' + error.message);
      }
    }
  };

  return (
    <div className={`offer-card ${offer.status}`}>
      <div className="offer-header">
        <h4>🏠 Rental Offer</h4>
        <span className={`status-badge ${offer.status}`}>
          {offer.status}
        </span>
      </div>
      
      <div className="offer-details">
        <div className="offer-row">
          <span>Monthly Rent:</span>
          <strong>${offer.offered_rent}</strong>
        </div>
        
        <div className="offer-row">
          <span>Commission (5%):</span>
          <strong>${(offer.offered_rent * 0.05).toFixed(2)}</strong>
        </div>
        
        {offer.terms && (
          <div className="offer-terms">
            <p>Terms: {offer.terms}</p>
          </div>
        )}
        
        <div className="offer-expiry">
          <small>Expires: {new Date(offer.expires_at).toLocaleDateString()}</small>
        </div>
      </div>
      
      {isTenant && offer.status === 'pending' && (
        <div className="offer-actions">
          <button 
            className="btn-accept" 
            onClick={handleAcceptOffer}
          >
            Accept Offer
          </button>
          <button 
            className="btn-reject" 
            onClick={handleRejectOffer}
          >
            Reject
          </button>
        </div>
      )}
      
      {offer.commission_paid && (
        <div className="commission-paid">
          ✅ Commission Paid
        </div>
      )}
    </div>
  );
};

export default OfferCard;