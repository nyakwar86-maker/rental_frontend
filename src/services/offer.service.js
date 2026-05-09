

// services/offer.service.js - FULLY UPDATED
import api from './api';

class OfferService {
  // Make an offer
  async makeOffer(conversationId, offerData) {
    const response = await api.post(`/conversations/${conversationId}/offer`, {
      ...offerData,
      conversation_id: conversationId
    });
    return response;
  }

  // Accept an offer
  async acceptOffer(conversationId) {
    const response = await api.post(`/conversations/${conversationId}/offer/accept`);
    return response.data;
  }

  // Reject an offer
  async rejectOffer(conversationId) {
    const response = await api.post(`/conversations/${conversationId}/offer/reject`);
    return response.data;
  }

  // Counter an offer
  async counterOffer(offerId, counterData) {
    const response = await api.post(`/offers/${offerId}/counter`, counterData);
    return response.data;
  }

  // Withdraw an offer
  async withdrawOffer(offerId) {
    const response = await api.post(`/offers/${offerId}/withdraw`);
    return response.data;
  }

  // Get offer details for a conversation
  async getOfferDetails(conversationId) {
    const response = await api.get(`/conversations/${conversationId}/offer`);
    return response.data;
  }

  // Get active offer for conversation
  async getActiveOffer(conversationId) {
    try {
      const response = await api.get(`/conversations/${conversationId}/offer/active`);
      console.log(response)
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null; // No active offer
      }
      throw error;
    }
  }

  // Get offer history
  async getOfferHistory(conversationId) {
    const response = await api.get(`/conversations/${conversationId}/offers/history`);
    return response.data;
  }

  // Pay commission
  async payCommission(offerId) {
    const response = await api.post(`/offers/${offerId}/pay-commission`);
    return response.data;
  }

  // Get user's offers
  async getMyOffers(filters = {}) {
    const response = await api.get('/offers/my-offers', { params: filters });
    return response.data;
  }

  // Get offer stats
  async getOfferStats() {
    const response = await api.get('/offers/stats');
    return response.data;
  }
}

export const offerService = new OfferService();
export default offerService;