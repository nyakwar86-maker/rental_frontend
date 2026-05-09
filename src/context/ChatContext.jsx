// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { conversationService } from '../services/conversation.service';
// import socketService from '../services/socket.service';
// import { useAuth } from './AuthContext';

// const ChatContext = createContext();

// export const useChat = () => useContext(ChatContext);

// export const ChatProvider = ({ children }) => {
//   const { user, token } = useAuth();
//   const [conversations, setConversations] = useState([]);
//   const [activeConversation, setActiveConversation] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Load user's conversations
//   const loadConversations = async () => {
//     try {
//       setLoading(true);
//       const response = await conversationService.getMyConversations();
//       setConversations(response.data.conversations || []);

//       // Calculate unread count
//       const unread = response.data.conversations?.reduce((count, conv) => {
//         const lastMessage = conv.messages?.[0];
//         if (lastMessage && !lastMessage.is_read && lastMessage.sender_id !== user?.id) {
//           return count + 1;
//         }
//         return count;
//       }, 0) || 0;

//       setUnreadCount(unread);
//     } catch (err) {
//       setError(err.message || 'Failed to load conversations');
//       console.error('Error loading conversations:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Start new conversation
//   const startConversation = async (apartmentId) => {
//     try {
//       const response = await conversationService.createConversation(apartmentId);
//       const newConversation = response.data.conversation;

//       // Add to conversations list
//       setConversations(prev => [newConversation, ...prev]);
//       return newConversation;
//     } catch (err) {
//       console.error('Error starting conversation:', err);
//       throw err;
//     }
//   };

//   // Send message
//   const sendMessage = async (conversationId, content) => {
//     try {
//       const response = await conversationService.sendMessage(conversationId, content);
//       return response.data.message;
//     } catch (err) {
//       console.error('Error sending message:', err);
//       throw err;
//     }
//   };

//   // Mark messages as read
//   const markAsRead = async (conversationId) => {
//     try {
//       await conversationService.markMessagesAsRead(conversationId);

//       // Update local state
//       setConversations(prev => prev.map(conv => {
//         if (conv.id === conversationId) {
//           return {
//             ...conv,
//             messages: conv.messages?.map(msg => ({
//               ...msg,
//               is_read: true
//             })) || []
//           };
//         }
//         return conv;
//       }));

//       // Update unread count
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) {
//       console.error('Error marking as read:', err);
//     }
//   };

//   // Setup socket listeners
//   useEffect(() => {
//     if (!user || !token) return;

//     // Connect socket
//     socketService.connect(token);

//     // Listen for new messages
//     const handleNewMessage = (message) => {
//       setConversations(prev => prev.map(conv => {
//         if (conv.id === message.conversation_id) {
//           return {
//             ...conv,
//             last_message_at: new Date(),
//             messages: [message, ...(conv.messages || [])]
//           };
//         }
//         return conv;
//       }));

//       // If not in active conversation, increment unread count
//       if (activeConversation?.id !== message.conversation_id) {
//         setUnreadCount(prev => prev + 1);
//       }
//     };

//     // Listen for new conversation notifications
//     const handleNewConversation = (data) => {
//       console.log('New conversation notification:', data);
//       loadConversations(); // Reload conversations
//     };

//     socketService.on('new_message', handleNewMessage);
//     socketService.on('new_message_notification', handleNewMessage);
//     socketService.on('new_conversation', handleNewConversation);

//     return () => {
//       socketService.off('new_message', handleNewMessage);
//       socketService.off('new_message_notification', handleNewMessage);
//       socketService.off('new_conversation', handleNewConversation);
//     };
//   }, [user, token, activeConversation]);

//   // Load conversations when user logs in
//   useEffect(() => {
//     if (user) {
//       loadConversations();
//     } else {
//       setConversations([]);
//       setUnreadCount(0);
//     }
//   }, [user]);

//   const value = {
//     conversations,
//     activeConversation,
//     setActiveConversation,
//     unreadCount,
//     loading,
//     error,
//     loadConversations,
//     startConversation,
//     sendMessage,
//     markAsRead
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };


import React, { createContext, useState, useContext, useEffect } from 'react';
import { conversationService } from '../services/conversation.service';
import socketService from '../services/socket.service';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [typingUsers, setTypingUsers] = useState({}); // { [conversationId]: { userId, userName, timestamp } }

  // Listen for typing events
  useEffect(() => {
    if (!user || !token) return;

    const handleTyping = (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: {
            userId: data.userId,
            userName: data.userName || data.userEmail,
            timestamp: data.timestamp
          }
        }));

        // Auto-clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const current = prev[data.conversationId];
            if (current && current.timestamp === data.timestamp) {
              const updated = { ...prev };
              delete updated[data.conversationId];
              return updated;
            }
            return prev;
          });
        }, 3000);
      }
    };

    socketService.on('typing', handleTyping);

    return () => {
      socketService.off('typing', handleTyping);
    };
  }, [user, token]);

  // Load user's conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationService.getMyConversations();
      setConversations(response.data.conversations || []);

      // Calculate unread count
      const unread = response.data.conversations?.reduce((count, conv) => {
        const lastMessage = conv.messages?.[0];
        if (lastMessage && !lastMessage.is_read && lastMessage.sender_id !== user?.id) {
          return count + 1;
        }
        return count;
      }, 0) || 0;

      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const startConversation = async (apartmentId) => {
    try {
      const response = await conversationService.createConversation(apartmentId);
      const newConversation = response.data.conversation;

      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      console.error('Error starting conversation:', err);
      throw err;
    }
  };

  // Send message
  const sendMessage = async (conversationId, content) => {
    try {
      const response = await conversationService.sendMessage(conversationId, content);
      return response.data.message;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  // Mark messages as read - UPDATED METHOD
  const markAsRead = async (conversationId) => {
    try {
      // Check if conversation service has markMessagesAsRead method
      // If not, we'll handle it locally
      if (conversationService.markMessagesAsRead) {
        await conversationService.markMessagesAsRead(conversationId);
      }
      // If method doesn't exist, we'll just update local state

      // Update local state to mark messages as read
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages?.map(msg => ({
              ...msg,
              is_read: msg.sender_id === user?.id ? msg.is_read : true
            })) || []
          };
        }
        return conv;
      }));

      // Update unread count
      setUnreadCount(prev => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return prev;

        const unreadInConv = conversation.messages?.filter(msg =>
          !msg.is_read && msg.sender_id !== user?.id
        ).length || 0;

        return Math.max(0, prev - unreadInConv);
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
      // Silently fail - this is not critical functionality
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!user || !token) return;

    // Connect socket
    socketService.connect(token);

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('📨 New message received in context:', message);

      setConversations(prev => prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            last_message_at: new Date(),
            messages: [message, ...(conv.messages || [])].slice(0, 1) // Keep only last message for preview
          };
        }
        return conv;
      }));

      // If not in active conversation, increment unread count
      if (activeConversation?.id !== message.conversation_id) {
        setUnreadCount(prev => prev + 1);
      }
    };

    // Listen for new conversation notifications
    const handleNewConversation = (data) => {
      console.log('💬 New conversation notification:', data);
      loadConversations(); // Reload conversations
    };

    // Listen for offer events
    const handleOfferCreated = (offer) => {
      console.log('📝 Offer created:', offer);
      loadConversations(); // Reload to update offer status
    };

    const handleOfferAccepted = (offer) => {
      console.log('✅ Offer accepted:', offer);
      loadConversations();
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('new_message_notification', handleNewMessage);
    socketService.on('new_conversation', handleNewConversation);
    socketService.on('offer_created', handleOfferCreated);
    socketService.on('offer_accepted', handleOfferAccepted);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('new_message_notification', handleNewMessage);
      socketService.off('new_conversation', handleNewConversation);
      socketService.off('offer_created', handleOfferCreated);
      socketService.off('offer_accepted', handleOfferAccepted);
    };
  }, [user, token, activeConversation]);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setUnreadCount(0);
    }
  }, [user]);

  const value = {
    typingUsers,
    isUserTyping: (conversationId, userId) => {
      const typing = typingUsers[conversationId];
      return typing && typing.userId === userId;
    },
    conversations,
    activeConversation,
    setActiveConversation,
    unreadCount,
    loading,
    error,
    loadConversations,
    startConversation,
    sendMessage,
    markAsRead
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};