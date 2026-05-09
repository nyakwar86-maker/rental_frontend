


// import api from './api';

// export const conversationService = {
//   // Get all conversations for current user
//   getMyConversations: () => 
//     api.get('/conversations'),
  
//   // Create new conversation
//   createConversation: (apartmentId) => 
//     api.post('/conversations', { apartment_id: apartmentId }),
  
//   // Get single conversation with messages
//   // getConversation: (id) => 
//   //   api.get(`/conversations/${id}`),

//   async getConversation(conversationId) {
//     try {
//       const response = await api.get(`/conversations/${conversationId}`);
//       // Ensure messages are sorted chronologically
//       if (response.data.conversation?.messages) {
//         response.data.conversation.messages.sort((a, b) => 
//           new Date(a.created_at) - new Date(b.created_at)
//         );
//       }
//       return response;
//     } catch (error) {
//       console.error('Failed to fetch conversation:', error);
//       throw error;
//     }
//   },

  
//   // Send message
//   sendMessage: (conversationId, content, messageType = 'text') => 
//     api.post(`/conversations/${conversationId}/messages`, {
//       content,
//       message_type: messageType
//     }),
  
//   // Mark messages as read - ADD THIS IF YOUR BACKEND SUPPORTS IT
//   markMessagesAsRead: (conversationId) => 
//     api.put(`/conversations/${conversationId}/read`),
  
//   // Make offer (landlord only)
//   makeOffer: (conversationId, offerData) => 
//     api.post(`/conversations/${conversationId}/offer`, offerData),
  
//   // Accept offer (tenant only)
//   acceptOffer: (conversationId) => 
//     api.post(`/conversations/${conversationId}/offer/accept`),
  
//   // Reject offer (tenant only)
//   rejectOffer: (conversationId) => 
//     api.post(`/conversations/${conversationId}/offer/reject`),
  
//   // Get offer details
//   getOfferDetails: (conversationId) => 
//     api.get(`/conversations/${conversationId}/offer`),
  
//   // Share location (landlord only, after commission paid)
//   shareLocation: (conversationId, locationData) => 
//     api.post(`/conversations/${conversationId}/share-location`, locationData)
// };


// services/conversation.service.js - FULLY UPDATED
import api from './api';

export const conversationService = {
  // Get all conversations for current user
  getMyConversations: async () => {
    const response = await api.get('/conversations');
    return response;
  },

  // Create new conversation
  createConversation: async (apartmentId) => {
    const response = await api.post('/conversations', { apartment_id: apartmentId });
    return response;
  },

  // Get single conversation with messages
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      
      // Ensure messages are sorted chronologically
      if (response.data?.conversation?.messages) {
        response.data.conversation.messages.sort((a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
        );
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (conversationId, content, messageType = 'text') => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      content,
      message_type: messageType
    });
    return response;
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId) => {
    const response = await api.put(`/conversations/${conversationId}/read`);
    return response;
  },

  // Make offer (landlord only) - DEPRECATED: Use offerService instead
  makeOffer: async (conversationId, offerData) => {
    console.warn('Deprecated: Use offerService.makeOffer() instead');
    const response = await api.post(`/conversations/${conversationId}/offer`, offerData);
    return response;
  },

  // Accept offer (tenant only) - DEPRECATED: Use offerService instead
  acceptOffer: async (conversationId) => {
    console.warn('Deprecated: Use offerService.acceptOffer() instead');
    const response = await api.post(`/conversations/${conversationId}/offer/accept`);
    return response;
  },

  // Reject offer (tenant only) - DEPRECATED: Use offerService instead
  rejectOffer: async (conversationId) => {
    console.warn('Deprecated: Use offerService.rejectOffer() instead');
    const response = await api.post(`/conversations/${conversationId}/offer/reject`);
    return response;
  },

  // Get offer details - DEPRECATED: Use offerService instead
  getOfferDetails: async (conversationId) => {
    console.warn('Deprecated: Use offerService.getOfferDetails() instead');
    const response = await api.get(`/conversations/${conversationId}/offer`);
    return response;
  },

  // Share location (landlord only, after commission paid)
  shareLocation: async (conversationId, locationData) => {
    const response = await api.post(`/conversations/${conversationId}/share-location`, locationData);
    return response;
  }
};