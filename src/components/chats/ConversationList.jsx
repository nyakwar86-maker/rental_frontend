
// import React, { useState, useEffect } from 'react';
// import { conversationService } from '../../services/conversation.service';
// import ConversationCard from './ConversationCard';

// const ConversationList = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   const loadConversations = async () => {
//     try {
//       setLoading(true);
//       const response = await conversationService.getMyConversations();
//       setConversations(response.data.conversations || []);
//     } catch (err) {
//       setError(err.message || 'Failed to load conversations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="loading">Loading conversations...</div>;
//   if (error) return <div className="error">{error}</div>;

//   return (
//     <div className="conversation-list">
//       <h2>Messages</h2>
//       {conversations.length === 0 ? (
//         <div className="empty-state">
//           <p>No conversations yet</p>
//           <p>Start a conversation by contacting a landlord about a property</p>
//         </div>
//       ) : (
//         conversations.map((conversation) => (
//           <ConversationCard 
//             key={conversation.id} 
//             conversation={conversation} 
//           />
//         ))
//       )}
//     </div>
//   );
// };

// export default ConversationList;



import React, { useState } from 'react';
import ConversationCard, { ConversationCardSkeleton } from './ConversationCard';
import { useAuth } from '../../context/AuthContext';
import { 
  FunnelIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const ConversationList = ({ 
  conversations, 
  onSelectConversation,
  activeConversationId,
  loading = false 
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, unread, offers

  // Filter conversations based on selected filter
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    
    const lastMessage = conv.messages?.[0];
    const hasUnread = lastMessage && 
                      !lastMessage.is_read && 
                      lastMessage.sender_id !== user?.id;
    
    const hasActiveOffer = conv.offers?.some(offer => 
      offer.status === 'accepted' || offer.status === 'pending'
    );
    
    if (filter === 'unread') return hasUnread;
    if (filter === 'offers') return hasActiveOffer;
    
    return true;
  });

  // Sort conversations by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.messages?.[0]?.created_at || a.last_message_at;
    const timeB = b.messages?.[0]?.created_at || b.last_message_at;
    return new Date(timeB) - new Date(timeA);
  });

  // Add current user info to each conversation
  const enrichedConversations = sortedConversations.map(conv => ({
    ...conv,
    currentUserId: user?.id,
    currentUserRole: user?.role
  }));

  // Handle conversation click
  const handleConversationClick = (conversation) => {
    console.log('Conversation clicked:', conversation.id);
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <ConversationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
        <p className="text-gray-500 text-center mb-6">
          Start a conversation by contacting a landlord about a property
        </p>
        <button
          onClick={() => window.location.href = '/search'}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 px-4 pt-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${
            filter === 'all' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({conversations.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${
            filter === 'unread' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('offers')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${
            filter === 'offers' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Offers
        </button>
      </div>

      {/* Conversation List */}
      <div className="divide-y divide-gray-100">
        {enrichedConversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onClick={() => handleConversationClick(conversation)}
          />
        ))}
      </div>

      {/* Empty filter state */}
      {filteredConversations.length === 0 && conversations.length > 0 && (
        <div className="py-8 text-center">
          <FunnelIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            No {filter === 'unread' ? 'unread' : 'offer'} conversations
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            View all conversations
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;