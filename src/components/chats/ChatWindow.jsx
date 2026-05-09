

// // components/chat/ChatWindow.jsx - FULLY UPDATED
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useChat } from '../../context/ChatContext';
// import { conversationService } from '../../services/conversation.service';
// import socketService from '../../services/socket.service';
// import OfferStatus from '../common/OfferStatus';
// import OfferForm from '../landlord/OfferForm';
// import OfferActions from '../tenant/OfferActions';
// import offerService from '../../services/offer.service';
// import {
//   PaperAirplaneIcon,
//   CheckIcon,
//   ClockIcon,
//   EyeIcon,
//   ArrowDownIcon,
//   UserCircleIcon,
//   CurrencyDollarIcon,
//   XMarkIcon,
//   DocumentTextIcon,
//   ChevronDownIcon,
//   ExclamationCircleIcon,
//   ArrowPathIcon,
//   ChatBubbleLeftRightIcon as ChatIcon,
//   BuildingOfficeIcon,
//   CalendarIcon,
//   MapPinIcon
// } from '@heroicons/react/24/outline';

// const ChatWindow = ({ conversation, user }) => {
//   const { sendMessage, markAsRead } = useChat();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [typingUserName, setTypingUserName] = useState('');
//   const [sending, setSending] = useState(false);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [page, setPage] = useState(1);

//   const messagesEndRef = useRef(null);
//   const messagesStartRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const typingDebounceRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const lastTypingEventRef = useRef(0);

//   const [viewOffer, setViewOffer] = useState(false);
  
//   const otherUser = user?.role === 'tenant'
//     ? conversation?.landlord
//     : conversation?.tenant;

//   // Offer states
//   const [showOfferForm, setShowOfferForm] = useState(false);
//   const [activeOffer, setActiveOffer] = useState(null);
//   const [offerLoading, setOfferLoading] = useState(false);
//   const [offerError, setOfferError] = useState(null);
//   const [offerHistory, setOfferHistory] = useState([]);
//   const [showOfferHistory, setShowOfferHistory] = useState(false);
//   const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // const handleScroll = useCallback(() => {
  //   const container = messagesContainerRef.current;
  //   if (!container || loadingMessages || !hasMoreMessages) return;
  //   if (container.scrollTop < 100) {
  //     loadMoreMessages();
  //   }
  // }, [loadingMessages, hasMoreMessages, conversation?.id]);

  // // Load conversation messages
  // const loadConversationMessages = async (conversationId, pageNum = 1) => {
  //   if (!conversationId || loadingMessages) return;
  //   try {
  //     setLoadingMessages(true);
  //     console.log(`📥 Loading messages for conversation ${conversationId}, page ${pageNum}`);
      
  //     const response = await conversationService.getConversation(conversationId);
  //     const loadedConversation = response.data.conversation;
      
  //     if (pageNum === 1) {
  //       setMessages(loadedConversation.messages || []);
  //       setPage(1);
  //       setTimeout(() => {
  //         scrollToBottom();
  //       }, 300);
  //     } else {
  //       setMessages(prev => [...(loadedConversation.messages || []), ...prev]);
  //     }

  //     if ((loadedConversation.messages?.length || 0) < 50) {
  //       setHasMoreMessages(false);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load messages:', error);
  //   } finally {
  //     setLoadingMessages(false);
  //   }
  // };

  // // Load offer data - UPDATED
  // const loadOfferData = async () => {
  //   if (!conversation?.id) return;
    
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     const response = await offerService.getOfferDetails(conversation.id);
  //     console.log(response.active_offer)
      
  //     if (response.active_offer) {
  //       setActiveOffer(response.active_offer);
  //     } else {
  //       setActiveOffer(null);
  //     }
      
  //     if (response.offers) {
  //       setOfferHistory(response.offers.sort((a, b) =>
  //         new Date(b.created_at) - new Date(a.created_at)
  //       ));
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to load offer data:', error);
      
  //     // Don't show error if no offer exists
  //     if (error.status !== 404) {
  //       setOfferError('Failed to load offer information');
  //     }
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

  // // Load initial data
  // useEffect(() => {
  //   if (conversation) {
  //     loadOfferData();
  //     loadConversationMessages(conversation.id, 1);
      
  //     // Join socket room
  //     socketService.joinConversation(conversation.id);
      
  //     // Mark as read
  //     setTimeout(() => {
  //       markAsRead(conversation.id);
  //     }, 100);
      
  //     return () => {
  //       socketService.leaveConversation(conversation.id);
  //       if (isTyping) {
  //         socketService.sendTyping(conversation.id, false);
  //       }
  //       clearTimeout(typingTimeoutRef.current);
  //       clearTimeout(typingDebounceRef.current);
  //     };
  //   }
  // }, [conversation?.id]);

  // // Socket listeners for typing
  // useEffect(() => {
  //   if (!conversation) return;
  //   const handleTyping = (data) => {
  //     if (data.conversationId === conversation.id && data.userId !== user?.id) {
  //       const now = Date.now();
  //       if (data.timestamp && now - data.timestamp > 3000) {
  //         return;
  //       }
  //       setOtherUserTyping(data.isTyping);
  //       setTypingUserName(data.userName || data.userEmail?.split('@')[0] || 'Someone');
  //       if (typingTimeoutRef.current) {
  //         clearTimeout(typingTimeoutRef.current);
  //       }
  //       if (data.isTyping) {
  //         typingTimeoutRef.current = setTimeout(() => {
  //           setOtherUserTyping(false);
  //         }, 2000);
  //       }
  //     }
  //   };

  //   const handleMessagesRead = (data) => {
  //     if (data.conversationId === conversation.id && data.readBy !== user?.id) {
  //       setMessages(prev => prev.map(msg => {
  //         if (msg.sender_id === user?.id && !msg.is_read) {
  //           return { ...msg, is_read: true };
  //         }
  //         return msg;
  //       }));
  //     }
  //   };

  //   socketService.on('typing', handleTyping);
  //   socketService.on('messages_read', handleMessagesRead);
    
  //   return () => {
  //     socketService.off('typing', handleTyping);
  //     socketService.off('messages_read', handleMessagesRead);
  //     clearTimeout(typingTimeoutRef.current);
  //   };
  // }, [conversation, user?.id]);

  // // Socket listeners for messages
  // useEffect(() => {
  //   const handleNewMessage = (message) => {
  //     if (message.conversation_id === conversation?.id) {
  //       setMessages(prev => [...prev, message]);
  //       scrollToBottom();
        
  //       if (message.sender_id !== user?.id) {
  //         setTimeout(() => {
  //           markAsRead(conversation.id);
  //         }, 100);
  //       }
  //     }
  //   };

  //   socketService.on('new_message', handleNewMessage);
    
  //   return () => {
  //     socketService.off('new_message', handleNewMessage);
  //   };
  // }, [conversation, user?.id]);

  // // Socket listeners for offer events
  // useEffect(() => {
  //   const handleNewOffer = (data) => {
  //     if (data.conversationId === conversation?.id) {
  //       setActiveOffer(data.offer);
  //       setOfferHistory(prev => [data.offer, ...prev]);
        
  //       const systemMessage = {
  //         id: `offer-${Date.now()}`,
  //         content: `📨 ${data.offer.sender_name} sent a new offer: $${data.offer.amount}/month for ${data.offer.lease_term} months`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
  //     }
  //   };

  //   const handleOfferAccepted = (data) => {
  //     if (data.conversationId === conversation?.id) {
  //       setActiveOffer(data.offer);
        
  //       setOfferHistory(prev => prev.map(offer =>
  //         offer.id === data.offer.id ? data.offer : offer
  //       ));
        
  //       const systemMessage = {
  //         id: `offer-accepted-${Date.now()}`,
  //         content: `✅ Offer accepted! ${data.offer.receiver_name} accepted $${data.offer.amount}/month`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
  //     }
  //   };

  //   const handleOfferRejected = (data) => {
  //     if (data.conversationId === conversation?.id) {
  //       setActiveOffer(data.offer);
        
  //       setOfferHistory(prev => prev.map(offer =>
  //         offer.id === data.offer.id ? data.offer : offer
  //       ));
        
  //       const systemMessage = {
  //         id: `offer-rejected-${Date.now()}`,
  //         content: `❌ Offer rejected. ${data.offer.receiver_name} declined the offer`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
  //     }
  //   };

  //   const handleOfferCountered = (data) => {
  //     if (data.conversationId === conversation?.id) {
  //       setActiveOffer(data.offer);
  //       setOfferHistory(prev => [data.offer, ...prev]);
        
  //       const systemMessage = {
  //         id: `offer-countered-${Date.now()}`,
  //         content: `🔄 Counter offer: ${data.offer.sender_name} proposed $${data.offer.amount}/month`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
  //     }
  //   };

  //   const handleOfferWithdrawn = (data) => {
  //     if (data.conversationId === conversation?.id) {
  //       setActiveOffer(null);
        
  //       setOfferHistory(prev => prev.map(offer =>
  //         offer.id === data.offerId ? { ...offer, status: 'withdrawn' } : offer
  //       ));
        
  //       const systemMessage = {
  //         id: `offer-withdrawn-${Date.now()}`,
  //         content: `🗑️ Offer withdrawn by ${data.userName}`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
  //     }
  //   };

  //   socketService.on('new_offer', handleNewOffer);
  //   socketService.on('offer_accepted', handleOfferAccepted);
  //   socketService.on('offer_rejected', handleOfferRejected);
  //   socketService.on('offer_countered', handleOfferCountered);
  //   socketService.on('offer_withdrawn', handleOfferWithdrawn);
    
  //   return () => {
  //     socketService.off('new_offer', handleNewOffer);
  //     socketService.off('offer_accepted', handleOfferAccepted);
  //     socketService.off('offer_rejected', handleOfferRejected);
  //     socketService.off('offer_countered', handleOfferCountered);
  //     socketService.off('offer_withdrawn', handleOfferWithdrawn);
  //   };
  // }, [conversation?.id]);

  // Offer management functions - UPDATED
  // const handleCreateOffer = async (offerData) => {
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     console.log('Creating offer:', {
  //       conversationId: conversation.id,
  //       propertyId: conversation.apartment?.id,
  //       offerData,
  //       userId: user?.id
  //     });

  //     // Validate required data
  //     if (!conversation?.id) {
  //       throw new Error('Conversation not found');
  //     }
      
  //     if (!conversation.apartment?.id) {
  //       throw new Error('Property not found');
  //     }
      
  //     if (!user?.id) {
  //       throw new Error('User not authenticated');
  //     }

  //     // Prepare offer payload
  //     const payload = {
  //       ...offerData,
  //       property_id: conversation.apartment.id,
  //       sender_id: user.id,
  //       sender_name: user.full_name || user.email,
  //       conversation_id: conversation.id
  //     };

  //     console.log('Sending offer payload:', payload);

  //     // Make API call
  //     const response = await offerService.makeOffer(conversation.id, payload);
      
  //     console.log('Offer response:', response);

  //     if (response.data?.offer) {
  //       const newOffer = response.data.offer;
        
  //       // Update state
  //       setActiveOffer(newOffer);
  //       setOfferHistory(prev => [newOffer, ...prev]);
  //       setShowOfferForm(false);
        
  //       // Emit socket event
  //       socketService.emitOfferCreated(conversation.id, newOffer);
        
  //       // Add system message
  //       const systemMessage = {
  //         id: `offer-${Date.now()}`,
  //         content: `📨 ${user.full_name || user.email} sent a new offer: $${newOffer.amount}/month for ${newOffer.lease_term} months`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
        
  //       // Refresh offer data
  //       await loadOfferData();
        
  //       return newOffer;
  //     } else {
  //       throw new Error('Invalid response from server');
  //     }

  //   } catch (error) {
  //     console.error('Failed to create offer:', error);
  //     const errorMsg = error.response?.data?.error || error.message || 'Failed to create offer';
  //     setOfferError(errorMsg);
  //     throw error;
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

  // const handleAcceptOffer = async (offerId) => {
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     console.log('Accepting offer:', offerId);
      
  //     const response = await offerService.acceptOffer(offerId);
      
  //     if (response.offer) {
  //       const updatedOffer = response.offer;
  //       setActiveOffer(updatedOffer);
        
  //       // Emit socket event
  //       socketService.emitOfferAccepted(conversation.id, updatedOffer);
        
  //       // Add system message
  //       const systemMessage = {
  //         id: `offer-accepted-${Date.now()}`,
  //         content: `✅ ${user.full_name || user.email} accepted the offer: $${updatedOffer.amount}/month`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
        
  //       // Refresh offer data
  //       await loadOfferData();
        
  //       return updatedOffer;
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to accept offer:', error);
  //     setOfferError(error.message || 'Failed to accept offer');
  //     throw error;
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

  // const handleRejectOffer = async (offerId) => {
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     console.log('Rejecting offer:', offerId);
      
  //     const response = await offerService.rejectOffer(offerId);
      
  //     if (response.offer) {
  //       const updatedOffer = response.offer;
  //       setActiveOffer(updatedOffer);
        
  //       // Emit socket event
  //       socketService.emitOfferRejected(conversation.id, updatedOffer);
        
  //       // Add system message
  //       const systemMessage = {
  //         id: `offer-rejected-${Date.now()}`,
  //         content: `❌ ${user.full_name || user.email} rejected the offer`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
        
  //       // Refresh offer data
  //       await loadOfferData();
        
  //       return updatedOffer;
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to reject offer:', error);
  //     setOfferError(error.message || 'Failed to reject offer');
  //     throw error;
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

  // const handleCounterOffer = async (offerId, counterData) => {
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     console.log('Countering offer:', offerId, counterData);
      
  //     const response = await offerService.counterOffer(offerId, counterData);
      
  //     if (response.offer) {
  //       const newCounterOffer = response.offer;
  //       setActiveOffer(newCounterOffer);
  //       setOfferHistory(prev => [newCounterOffer, ...prev]);
        
  //       // Emit socket event
  //       socketService.emitOfferCountered(conversation.id, newCounterOffer);
        
  //       // Add system message
  //       const systemMessage = {
  //         id: `offer-countered-${Date.now()}`,
  //         content: `🔄 ${user.full_name || user.email} made a counter offer: $${newCounterOffer.amount}/month`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
        
  //       // Refresh offer data
  //       await loadOfferData();
        
  //       return newCounterOffer;
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to counter offer:', error);
  //     setOfferError(error.message || 'Failed to counter offer');
  //     throw error;
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

  // const handleWithdrawOffer = async (offerId) => {
  //   try {
  //     setOfferLoading(true);
  //     setOfferError(null);
      
  //     console.log('Withdrawing offer:', offerId);
      
  //     const response = await offerService.withdrawOffer(offerId);
      
  //     if (response.success) {
  //       setActiveOffer(null);
        
  //       // Emit socket event
  //       socketService.emitOfferWithdrawn(conversation.id, offerId);
        
  //       // Add system message
  //       const systemMessage = {
  //         id: `offer-withdrawn-${Date.now()}`,
  //         content: `🗑️ ${user.full_name || user.email} withdrew the offer`,
  //         sender_id: 'system',
  //         created_at: new Date().toISOString(),
  //         is_read: true,
  //         type: 'system_notification'
  //       };
        
  //       setMessages(prev => [...prev, systemMessage]);
        
  //       // Refresh offer data
  //       await loadOfferData();
        
  //       return true;
  //     }
      
  //   } catch (error) {
  //     console.error('Failed to withdraw offer:', error);
  //     setOfferError(error.message || 'Failed to withdraw offer');
  //     throw error;
  //   } finally {
  //     setOfferLoading(false);
  //   }
  // };

//   // Message handling functions
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({
//         behavior: 'smooth',
//         block: 'end'
//       });
//     }, 100);
//   };

//   const handleTypingChange = (e) => {
//     const value = e.target.value;
//     setNewMessage(value);
    
//     // Send typing indicator
//     if (conversation && value.length > 0 && !isTyping) {
//       socketService.sendTyping(conversation.id, true);
//       setIsTyping(true);
      
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
      
//       typingTimeoutRef.current = setTimeout(() => {
//         socketService.sendTyping(conversation.id, false);
//         setIsTyping(false);
//       }, 1500);
//     } else if (conversation && value.length === 0 && isTyping) {
//       socketService.sendTyping(conversation.id, false);
//       setIsTyping(false);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || sending || !conversation) return;
//     try {
//       setSending(true);
      
//       if (isTyping) {
//         socketService.sendTyping(conversation.id, false);
//         setIsTyping(false);
//         clearTimeout(typingTimeoutRef.current);
//       }
      
//       await sendMessage(conversation.id, newMessage);
//       setNewMessage('');
      
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       alert(error.message || 'Failed to send message');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage(e);
//     }
//   };

//   // Component for typing indicator
//   const TypingIndicator = () => (
//     <div className="flex justify-start mb-4 animate-fadeIn">
//       <div className="flex-shrink-0 mr-2">
//         {otherUser?.avatar_url ? (
//           <img
//             src={otherUser.avatar_url}
//             alt={otherUser.full_name}
//             className="h-8 w-8 rounded-full object-cover"
//           />
//         ) : (
//           <UserCircleIcon className="h-8 w-8 text-gray-400" />
//         )}
//       </div>
//       <div className="max-w-xs lg:max-w-md rounded-lg rounded-bl-none bg-gray-100 p-3">
//         <div className="flex items-center space-x-1">
//           <div className="flex space-x-1">
//             <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
//             <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
//             <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
//           </div>
//           <span className="text-xs text-gray-500 ml-2">
//             {typingUserName} is typing...
//           </span>
//         </div>
//       </div>
//     </div>
//   );

//   // Enhanced MessageBubble component
//   const MessageBubble = ({ message, index }) => {
//     const isOwnMessage = message.sender_id === user.id;
//     const isSystemMessage = message.sender_id === 'system';
    
//     const messageTime = new Date(message.created_at);
//     const formattedTime = messageTime.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//     const formattedDate = messageTime.toLocaleDateString([], {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
    
//     const prevMessage = messages[index - 1];
//     const showDateSeparator = !prevMessage ||
//       new Date(prevMessage.created_at).toDateString() !== messageTime.toDateString();

//     // Render system message differently
//     if (isSystemMessage) {
//       return (
//         <>
//           {showDateSeparator && (
//             <div className="flex justify-center my-4">
//               <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
//                 {formattedDate}
//               </div>
//             </div>
//           )}
//           <div className="flex justify-center mb-3">
//             <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-lg text-center">
//               {message.content}
//             </div>
//           </div>
//         </>
//       );
//     }

//     return (
//       <>
//         {showDateSeparator && (
//           <div className="flex justify-center my-4">
//             <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
//               {formattedDate}
//             </div>
//           </div>
//         )}
//         <div
//           className={`flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
//           data-message-index={index}
//         >
//           {!isOwnMessage && (
//             <div className="flex-shrink-0 mr-2">
//               {otherUser?.avatar_url ? (
//                 <img
//                   src={otherUser.avatar_url}
//                   alt={otherUser.full_name}
//                   className="h-8 w-8 rounded-full object-cover"
//                 />
//               ) : (
//                 <UserCircleIcon className="h-8 w-8 text-gray-400" />
//               )}
//             </div>
//           )}
//           <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${isOwnMessage
//             ? 'bg-blue-600 text-white rounded-br-none'
//             : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}
//           >
//             <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            
//             <div className="flex items-center justify-between mt-1">
//               <span className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
//                 {formattedTime}
//               </span>
              
//               {isOwnMessage && (
//                 <div className="ml-2" title="Read">
//                   {message.is_read ? (
//                     <div className="flex items-center">
//                       <EyeIcon className="h-3 w-3 text-green-300 mr-0.5" />
//                       <CheckIcon className="h-3 w-3 text-green-300" />
//                     </div>
//                   ) : (
//                     <CheckIcon className="h-3 w-3 text-gray-300" title="Sent" />
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//           {isOwnMessage && (
//             <div className="flex-shrink-0 ml-2">
//               {user?.avatar_url ? (
//                 <img
//                   src={user.avatar_url}
//                   alt={user.full_name}
//                   className="h-8 w-8 rounded-full object-cover"
//                 />
//               ) : (
//                 <UserCircleIcon className="h-8 w-8 text-blue-400" />
//               )}
//             </div>
//           )}
//         </div>
//       </>
//     );
//   };

//   // Offer Status Banner
//   const OfferStatusBanner = () => {
//     if (!activeOffer) return null;
//     const isLandlord = user?.role === 'landlord';
//     const isTenant = user?.role === 'tenant';
//     const isOfferSender = activeOffer.sender_id === user.id;
    
//     return (
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <div className="bg-blue-100 p-2 rounded-lg mr-3">
//               <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
//             </div>
//             <div>
//               <div className="flex items-center">
//                 <h4 className="font-bold text-blue-900">Active Offer</h4>
//                 <span className="ml-2">
//                   <OfferStatus offer={activeOffer} userRole={user.role}/>
//                 </span>
//               </div>
//               <div className="mt-1 space-y-1">
//                 <p className="text-blue-800 font-medium">
//                   ${activeOffer.amount}/month • {activeOffer.lease_term} months
//                 </p>
//                 {activeOffer.message && (
//                   <p className="text-sm text-blue-600 italic">"{activeOffer.message}"</p>
//                 )}
//                 <p className="text-xs text-blue-500">
//                   Sent by {activeOffer.sender_name} • {new Date(activeOffer.created_at).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             {activeOffer.status === 'pending' && (
//               <>
//                 {isTenant && !isOfferSender && (
//                   <OfferActions
//                     conversationId = {conversation.id}
//                     offer={activeOffer}
//                     onAccept={handleAcceptOffer}
//                     onReject={handleRejectOffer}
//                     onCounter={handleCounterOffer}
//                     loading={offerLoading}
//                   />
//                 )}
                
//                 {isOfferSender && (
//                   <button
//                     onClick={() => handleWithdrawOffer(activeOffer.id)}
//                     disabled={offerLoading}
//                     className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {offerLoading ? 'Processing...' : 'Withdraw'}
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setViewOffer(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <XMarkIcon className="h-6 w-6" />
//                 </button>
//               </>
//             )}
            
//             {(activeOffer.status === 'accepted' || activeOffer.status === 'rejected') && (
//              <>
//                 <button
//                   onClick={() => setShowOfferHistory(true)}
//                   className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
//                 >
//                   View Details
//                 </button>
//                 <button
//                   onClick={() => setViewOffer(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <XMarkIcon className="h-6 w-6" />
//                 </button>
//              </>
             
              
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Property Details Component
//   const PropertyDetails = () => {
//     if (!conversation?.apartment) return null;
//     const property = conversation.apartment;

//     console.log(property)
    
//     return (
//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4 shadow-sm">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <div className="flex items-center mb-2">
//               <BuildingOfficeIcon className="h-5 w-5 text-green-600 mr-2" />
//               <h4 className="font-bold text-green-900">Property Details</h4>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                 <h5 className="font-semibold text-green-800">{property.title}</h5>
//                 <p className="text-sm text-green-700 flex items-center mt-1">
//                   <MapPinIcon className="h-4 w-4 mr-1" />
//                   {property.address}
//                 </p>
//               </div>
              
//               <div className="space-y-1">
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Listed Price:</span>
//                   <span className="font-semibold text-green-800">KES {property.rent_amount}/month</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Bedrooms:</span>
//                   <span className="font-semibold text-green-800">{property.bedrooms}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Bathrooms:</span>
//                   <span className="font-semibold text-green-800">{property.bathrooms}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-green-700">Available:</span>
//                   <span className="font-semibold text-green-800 flex items-center">
//                     <CalendarIcon className="h-4 w-4 mr-1" />
//                     {property.available_date ? new Date(property.available_date).toLocaleDateString() : 'Immediate'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <button
//             onClick={() => setShowPropertyDetails(false)}
//             className="ml-4 text-green-600 hover:text-green-700"
//           >
//             <XMarkIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Offer History Modal
//   const OfferHistoryModal = () => {
//     if (!showOfferHistory) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-bold text-gray-900">Offer History</h3>
//               <button
//                 onClick={() => setShowOfferHistory(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XMarkIcon className="h-6 w-6" />
//               </button>
//             </div>
            
//             {offerError && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//                 <div className="flex items-center">
//                   <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
//                   <p className="text-red-700 text-sm">{offerError}</p>
//                 </div>
//               </div>
//             )}
            
//             {offerLoading ? (
//               <div className="flex justify-center py-8">
//                 <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
//               </div>
//             ) : offerHistory.length === 0 ? (
//               <div className="text-center py-8">
//                 <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No offer history found</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {offerHistory.map((offer, index) => (
//                   <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <div className="flex items-center">
//                           <span className="font-semibold text-gray-900">
//                             ${offer.amount}/month
//                           </span>
//                           <span className="ml-2">
//                             <OfferStatus offer={activeOffer} userRole={user.role} />
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600">
//                           {offer.lease_term} months • {offer.sender_name}
//                         </p>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {new Date(offer.created_at).toLocaleDateString()}
//                       </span>
//                     </div>
                    
//                     {offer.message && (
//                       <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
//                         "{offer.message}"
//                       </p>
//                     )}
                    
//                     {index === 0 && (
//                       <div className="mt-2 pt-2 border-t border-gray-200">
//                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                           <CheckIcon className="h-3 w-3 mr-1" />
//                           Latest Offer
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Chat Action Buttons
//   const ChatActionButtons = () => (
//     <div className="flex items-center space-x-3">
//       <button
//         onClick={() => setShowPropertyDetails(!showPropertyDetails)}
//         className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
//         title="Property Details"
//       >
//         <BuildingOfficeIcon className="h-5 w-5 mr-1" />
//         <span className="hidden sm:inline">Property</span>
//       </button>
      
//       {user?.role === 'landlord' && (
//         <>
//           <button
//             onClick={() => setShowOfferForm(true)}
//             className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow"
//             disabled={!!activeOffer && activeOffer.status === 'pending'}
//           >
//             <CurrencyDollarIcon className="h-5 w-5 mr-2" />
//             {activeOffer?.status === 'pending' ? 'Offer Sent' : 'Make Offer'}
//           </button>
//         </>
//       )}
      
//       {offerHistory.length > 0 && (
//         <button
//           onClick={() => setShowOfferHistory(true)}
//           className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
//           title="Offer History"
//         >
//           <DocumentTextIcon className="h-5 w-5 mr-1" />
//           <span className="hidden sm:inline">History</span>
//           <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
//             {offerHistory.length}
//           </span>
//         </button>
//       )}

//         <button
//           onClick={() => setViewOffer(true)}
//           className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
//           title="Active Offer"
//         >
//           <DocumentTextIcon className="h-5 w-5 mr-1" />
//           <span className="hidden sm:inline">Offers</span>
//         </button>

//     </div>
//   );

//   // Chat Header
//   const ChatHeader = () => (
//     <div className="bg-white border-b border-gray-200 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="relative">
//             {otherUser?.avatar_url ? (
//               <img
//                 src={otherUser.avatar_url}
//                 alt={otherUser.full_name}
//                 className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-white shadow"
//               />
//             ) : (
//               <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4">
//                 <span className="text-white font-medium text-lg">
//                   {otherUser?.full_name?.charAt(0) || otherUser?.email?.charAt(0)}
//                 </span>
//               </div>
//             )}
//             <div className="absolute bottom-0 right-4 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
//           </div>
          
//           <div>
//             <div className="flex items-center">
//               <h3 className="font-bold text-gray-900 text-lg">
//                 {otherUser?.full_name || otherUser?.email}
//               </h3>
//               {otherUserTyping && (
//                 <span className="ml-2 text-xs text-green-600 flex items-center animate-pulse">
//                   <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
//                   typing...
//                 </span>
//               )}
//             </div>
//             <p className="text-sm text-gray-500 truncate max-w-xs">
//               {conversation.apartment?.title}
//             </p>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <ChatActionButtons />
//         </div>
//       </div>
//     </div>
//   );

//   // Scroll to bottom button
//   const ScrollToBottomButton = () => {
//     const [showButton, setShowButton] = useState(false);
//     useEffect(() => {
//       const container = messagesContainerRef.current;
//       if (!container) return;
//       const handleContainerScroll = () => {
//         const { scrollTop, scrollHeight, clientHeight } = container;
//         const isNearBottom = scrollHeight - scrollTop - clientHeight > 200;
//         setShowButton(isNearBottom);
//       };
//       container.addEventListener('scroll', handleContainerScroll);
//       return () => container.removeEventListener('scroll', handleContainerScroll);
//     }, []);
    
//     if (!showButton) return null;
    
//     return (
//       <button
//         onClick={scrollToBottom}
//         className="fixed bottom-32 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-xl z-10"
//         title="Scroll to bottom"
//       >
//         <ArrowDownIcon className="h-5 w-5" />
//       </button>
//     );
//   };

//   if (!conversation) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
//         <div className="text-center max-w-md">
//           <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 mx-auto">
//             <ChatIcon className="h-10 w-10 text-blue-600" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-3">
//             Select a Conversation
//           </h3>
//           <p className="text-gray-600 mb-6">
//             Choose a conversation from the sidebar to start chatting about properties, make offers, and negotiate terms.
//           </p>
//           <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
//             <CurrencyDollarIcon className="h-4 w-4" />
//             <span>Make offers directly in chat</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
//       <ChatHeader />
      
//       {/* Property Details */}
//       {showPropertyDetails && <PropertyDetails />}
      
//       {/* Offer Status Banner */}
//       {!loadingMessages && activeOffer && viewOffer && <OfferStatusBanner />}
      
//       {/* Messages Container */}
//       <div
//         ref={messagesContainerRef}
//         onScroll={handleScroll}
//         className="flex-1 overflow-y-auto p-4 md:p-6 relative"
//       >
//         {loadingMessages && page > 1 && (
//           <div className="flex justify-center py-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         )}
//         {messages.length === 0 && !loadingMessages ? (
//           <div className="flex flex-col items-center justify-center h-full">
//             <div className="text-center max-w-md">
//               <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 mx-auto">
//                 <ChatIcon className="h-8 w-8 text-blue-600" />
//               </div>
//               <p className="text-gray-600 mb-2">No messages yet</p>
//               <p className="text-sm text-gray-500 mb-6">
//                 Start the conversation by sending a message or make an offer to begin negotiations.
//               </p>
              
//               {user?.role === 'landlord' && !activeOffer && (
//                 <button
//                   onClick={() => setShowOfferForm(true)}
//                   className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
//                 >
//                   <CurrencyDollarIcon className="h-5 w-5 mr-2" />
//                   Make First Offer
//                 </button>
//               )}
//             </div>
//           </div>
//         ) : (
//           <>
//             <div ref={messagesStartRef} />
//             {messages.map((message, index) => (
//               <MessageBubble key={message.id || index} message={message} index={index} />
//             ))}
//             {otherUserTyping && <TypingIndicator />}
//             <div ref={messagesEndRef} />
//           </>
//         )}
        
//         <ScrollToBottomButton />
//       </div>
      
//       {/* Message Input Area */}
//       <div className="border-t border-gray-200 bg-white p-4 md:p-6">
//         {isTyping && (
//           <div className="text-xs text-blue-600 mb-2 flex items-center animate-fadeIn">
//             <div className="flex space-x-1 mr-2">
//               <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
//               <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
//               <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
//             </div>
//             <span>You're typing...</span>
//           </div>
//         )}
//         <form onSubmit={handleSendMessage} className="relative">
//           <div className="flex space-x-3">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={handleTypingChange}
//               onKeyDown={handleKeyDown}
//               placeholder="Type your message here..."
//               className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-150 text-gray-900 placeholder-gray-500"
//               disabled={sending}
//               autoFocus
//               maxLength={2000}
//             />
            
//             <button
//               type="submit"
//               disabled={!newMessage.trim() || sending}
//               className={`px-5 py-3 rounded-xl flex items-center justify-center transition-all duration-150 ${!newMessage.trim() || sending
//                   ? 'bg-gray-300 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 transform hover:scale-105'
//                 }`}
//             >
//               {sending ? (
//                 <ArrowPathIcon className="h-5 w-5 text-white animate-spin" />
//               ) : (
//                 <PaperAirplaneIcon className="h-5 w-5 text-white" />
//               )}
//             </button>
//           </div>
          
//           <div className="flex items-center justify-between mt-3">
//             <div className="text-xs text-gray-500">
//               Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs border border-gray-300">Enter</kbd> to send
//             </div>
//             <div className="text-xs text-gray-500">
//               {messages.length} messages • {newMessage.length}/2000
//             </div>
//           </div>
//         </form>
//       </div>
      
//       {/* Offer Form Modal */}
//       {showOfferForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Negotiate terms for {conversation.apartment?.title}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setShowOfferForm(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <XMarkIcon className="h-6 w-6" />
//                 </button>
//               </div>
              
//               <OfferForm
//                 conversation={conversation}
//                 property={conversation.apartment}
//                 currentPrice={conversation.apartment?.price}
//                 onSubmit={handleCreateOffer}
//                 onCancel={() => setShowOfferForm(false)}
//                 loading={offerLoading}
//                 landlordName={user?.role === 'landlord' ? user.full_name : otherUser?.full_name}
//               />
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Offer History Modal */}
//       <OfferHistoryModal />
      
//       {/* Global CSS */}
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(5px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         ::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 3px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 3px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ChatWindow;



// components/chat/ChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { conversationService } from '../../services/conversation.service';
import socketService from '../../services/socket.service';

import OfferForm from '../landlord/OfferForm';
import OfferActions from '../tenant/OfferActions';
import offerService from '../../services/offer.service';

import {
//   PaperAirplaneIcon,
//   CheckIcon,
//   ClockIcon,
//   EyeIcon,
//   ArrowDownIcon,
//   UserCircleIcon,
//   CurrencyDollarIcon,
//   XMarkIcon,
//   DocumentTextIcon,
//   ChevronDownIcon,
//   ExclamationCircleIcon,
//   ArrowPathIcon,
//   ChatBubbleLeftRightIcon as ChatIcon,
//   BuildingOfficeIcon,
  CalendarIcon,
  PaperAirplaneIcon,
  CheckIcon,
  EyeIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  MapPinIcon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon as ChatIcon
} from '@heroicons/react/24/outline';

const ChatWindow = ({ conversation, user }) => {
  const { sendMessage, markAsRead } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);

  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastTypingEventRef = useRef(0);

  const [viewOffer, setViewOffer] = useState(false);
  
  const otherUser = user?.role === 'tenant'
    ? conversation?.landlord
    : conversation?.tenant;

  // Offer states
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState(null);
  const [offerHistory, setOfferHistory] = useState([]);
  const [showOfferHistory, setShowOfferHistory] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // OFFER MAMANGEMNT FUNCTIONS
    const handleCreateOffer = async (offerData) => {
    try {
      setOfferLoading(true);
      setOfferError(null);
      
      console.log('Creating offer:', {
        conversationId: conversation.id,
        propertyId: conversation.apartment?.id,
        offerData,
        userId: user?.id
      });

      // Validate required data
      if (!conversation?.id) {
        throw new Error('Conversation not found');
      }
      
      if (!conversation.apartment?.id) {
        throw new Error('Property not found');
      }
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Prepare offer payload
      const payload = {
        ...offerData,
        property_id: conversation.apartment.id,
        sender_id: user.id,
        sender_name: user.full_name || user.email,
        conversation_id: conversation.id
      };

      console.log('Sending offer payload:', payload);

      // Make API call
      const response = await offerService.makeOffer(conversation.id, payload);
      
      console.log('Offer response:', response);

      if (response.data?.offer) {
        const newOffer = response.data.offer;
        
        // Update state
        setActiveOffer(newOffer);
        setOfferHistory(prev => [newOffer, ...prev]);
        setShowOfferForm(false);
        
        // Emit socket event
        socketService.emitOfferCreated(conversation.id, newOffer);
        
        // Add system message
        const systemMessage = {
          id: `offer-${Date.now()}`,
          content: `📨 ${user.full_name || user.email} sent a new offer: $${newOffer.amount}/month for ${newOffer.lease_term} months`,
          sender_id: 'system',
          created_at: new Date().toISOString(),
          is_read: true,
          type: 'system_notification'
        };
        
        setMessages(prev => [...prev, systemMessage]);
        
        // Refresh offer data
        await loadOfferData();
        
        return newOffer;
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('Failed to create offer:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create offer';
      setOfferError(errorMsg);
      throw error;
    } finally {
      setOfferLoading(false);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    if (!conversation) return;

    const load = async () => {
      const res = await conversationService.getConversation(conversation.id);
      const conv = res.data.conversation;

      setMessages(conv.messages || []);
      setActiveOffer(conv.active_offer || null);
    };

    load();
    socketService.joinConversation(conversation.id);

    setTimeout(() => markAsRead(conversation.id), 100);

    return () => socketService.leaveConversation(conversation.id);
  }, [conversation?.id]);

  // ================= SOCKET =================
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.conversation_id === conversation?.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === conversation?.id) {
        setOtherUserTyping(data.isTyping);
        setTypingUserName(data.name || 'User');
      }
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('typing', handleTyping);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('typing', handleTyping);
    };
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ================= SEND =================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    await sendMessage(conversation.id, newMessage);
    setNewMessage('');
    setSending(false);
  };

    // Offer Status Banner
  const OfferStatusBanner = () => {
    if (!activeOffer) return null;
    const isLandlord = user?.role === 'landlord';
    const isTenant = user?.role === 'tenant';
    const isOfferSender = activeOffer.sender_id === user.id;
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="font-bold text-blue-900">Active Offer</h4>
                <span className="ml-2">
                  <OfferStatus offer={activeOffer} userRole={user.role}/>
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-blue-800 font-medium">
                  ${activeOffer.amount}/month • {activeOffer.lease_term} months
                </p>
                {activeOffer.message && (
                  <p className="text-sm text-blue-600 italic">"{activeOffer.message}"</p>
                )}
                <p className="text-xs text-blue-500">
                  Sent by {activeOffer.sender_name} • {new Date(activeOffer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeOffer.status === 'pending' && (
              <>
                {isTenant && !isOfferSender && (
                  <OfferActions
                    conversationId = {conversation.id}
                    offer={activeOffer}
                    onAccept={handleAcceptOffer}
                    onReject={handleRejectOffer}
                    onCounter={handleCounterOffer}
                    loading={offerLoading}
                  />
                )}
                
                {isOfferSender && (
                  <button
                    onClick={() => handleWithdrawOffer(activeOffer.id)}
                    disabled={offerLoading}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {offerLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                )}
                <button
                  onClick={() => setViewOffer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </>
            )}
            
            {(activeOffer.status === 'accepted' || activeOffer.status === 'rejected') && (
             <>
                <button
                  onClick={() => setShowOfferHistory(true)}
                  className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => setViewOffer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
             </>
             
              
            )}
          </div>
        </div>
      </div>
    );
  };

  // Property Details Component
  const PropertyDetails = () => {
    if (!conversation?.apartment) return null;
    const property = conversation.apartment;

    console.log(property)
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-50 p-2 mb-1 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* <div className="flex items-center mb-2">
              <BuildingOfficeIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-bold text-green-900">Property Details</h4>
            </div> */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h5 className="font-semibold text-green-800">{property.title}</h5>
                <p className="text-sm text-green-700 flex items-center mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {property.address}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700">Listed Price:</span>
                  <span className="font-semibold text-green-800">KES {property.rent_amount}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Available:</span>
                  <span className="font-semibold text-green-800 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {property.available_date ? new Date(property.available_date).toLocaleDateString() : 'Immediate'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowPropertyDetails(false)}
            className="ml-4 text-green-600 hover:text-green-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Offer History Modal
  const OfferHistoryModal = () => {
    if (!showOfferHistory) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Offer History</h3>
              <button
                onClick={() => setShowOfferHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {offerError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{offerError}</p>
                </div>
              </div>
            )}
            
            {offerLoading ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : offerHistory.length === 0 ? (
              <div className="text-center py-8">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No offer history found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offerHistory.map((offer, index) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">
                            ${offer.amount}/month
                          </span>
                          <span className="ml-2">
                            <OfferStatus offer={activeOffer} userRole={user.role} />
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {offer.lease_term} months • {offer.sender_name}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {offer.message && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                        "{offer.message}"
                      </p>
                    )}
                    
                    {index === 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Latest Offer
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // ================= MESSAGE =================
  const MessageBubble = ({ message }) => {
    const isOwn = message.sender_id === user.id;

    const time = new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[75%] px-5 py-3.5 transition hover:shadow-md ${
            isOwn
              ? 'bg-blue-600 text-white rounded-2xl rounded-br-none'
              : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          <div className="flex items-center justify-end mt-2 text-[10px] opacity-70 space-x-1">
            <span>{time}</span>

            {isOwn && (
              message.is_read ? (
                <>
                  <EyeIcon className="h-3 w-3" />
                  <CheckIcon className="h-3 w-3" />
                </>
              ) : (
                <CheckIcon className="h-3 w-3" />
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // ================= HEADER =================
  const Header = () => (
    <div className="px-5 py-3 bg-white border-b flex justify-between items-center">

      {/* LEFT */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            otherUserTyping ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
          }`} />
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            {otherUser?.full_name || otherUser?.email}
          </h3>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* PROPERTY */}
        <button
          onClick={() => setShowPropertyDetails(!showPropertyDetails)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <BuildingOfficeIcon className="h-4 w-4" />
          Property
          <ChevronDownIcon className={`h-4 w-4 ${showPropertyDetails ? 'rotate-180' : ''}`} />
        </button>

        {/* HISTORY */}
        {activeOffer && (
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded-lg"
          >
            <DocumentTextIcon className="h-4 w-4" />
            History
          </button>
        )}

        {/* MAKE OFFER */}
        {user?.role === 'landlord' && (
          <button
            onClick={() => setShowOfferForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg"
          >
            <CurrencyDollarIcon className="h-4 w-4" />
             {activeOffer?.status === 'pending' ? 'Offer Sent' : 'Make Offer'}
          </button>
        )}
      </div>
    </div>
  );

  // ================= TYPING =================
  const TypingIndicator = () => (
    <div className="text-xs text-gray-500 italic px-4">
      {typingUserName} is typing...
    </div>
  );

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ChatIcon className="h-10 w-10 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex flex-col h-full max-w-5xl mx-auto w-full bg-white rounded-xl shadow border">

        <Header />

        {/* PROPERTY PANEL */}
        {showPropertyDetails && <PropertyDetails/>}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {otherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT (UNCHANGED) */}
        <div className="border-t border-gray-200 bg-white p-4 md:p-6">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={sending}
              />

              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className={`px-5 py-3 rounded-xl flex items-center justify-center ${
                  !newMessage.trim() || sending
                    ? 'bg-gray-300'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              >
                {sending ? (
                  <span className="text-white text-sm">...</span>
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* OFFER FORM */}
        {showOfferForm && (
          <OfferForm
            conversation={conversation}
            onClose={() => setShowOfferForm(false)}
          />
        )}

        {/* Offer Form Modal */}
      {showOfferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
              
              <OfferForm
                conversation={conversation}
                property={conversation.apartment}
                currentPrice={conversation.apartment?.price}
                onSubmit={handleCreateOffer}
                onCancel={() => setShowOfferForm(false)}
                loading={offerLoading}
                landlordName={user?.role === 'landlord' ? user.full_name : otherUser?.full_name}
              />
          </div>
        </div>
      )}

        {/* OFFER ACTIONS */}
        {activeOffer && user?.role === 'tenant' && (
          <OfferActions offer={activeOffer} />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;