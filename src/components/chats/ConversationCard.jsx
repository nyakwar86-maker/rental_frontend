// import React from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   ChatBubbleLeftRightIcon,
//   UserCircleIcon,
//   CheckIcon,
//   ClockIcon,
//   MapPinIcon
// } from '@heroicons/react/24/outline';

// const ConversationCard = ({ 
//   conversation, 
//   isActive = false,
//   onClick 
// }) => {
//   // Determine other user based on current user's role
//   const currentUserRole = conversation.currentUserRole; // You need to pass this
//   const otherUser = currentUserRole === 'tenant' 
//     ? conversation.landlord 
//     : conversation.tenant;

//   // Get last message
//   const lastMessage = conversation.messages?.[0];
//   const lastMessageTime = lastMessage?.created_at 
//     ? new Date(lastMessage.created_at) 
//     : new Date(conversation.last_message_at);

//   // Format time
//   const formatTime = (date) => {
//     const now = new Date();
//     const diffMs = now - date;
//     const diffHours = diffMs / (1000 * 60 * 60);
    
//     if (diffHours < 24) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } else if (diffHours < 48) {
//       return 'Yesterday';
//     } else {
//       return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//     }
//   };

//   // Check if there are unread messages
//   const hasUnread = lastMessage && 
//                     !lastMessage.is_read && 
//                     lastMessage.sender_id !== conversation.currentUserId;

//   // Check if there's an active offer
//   const activeOffer = conversation.offers?.find(offer => 
//     offer.status === 'accepted' || offer.status === 'pending'
//   );

//   // Check if commission is paid
//   const commissionPaid = conversation.offers?.some(offer => 
//     offer.commission_paid
//   );

//   return (
//     <div
//       onClick={onClick}
//       className={`block w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
//         isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//       }`}
//     >
//       <div className="flex items-start space-x-3">
//         {/* User Avatar */}
//         <div className="flex-shrink-0">
//           {otherUser?.avatar_url ? (
//             <img
//               src={otherUser.avatar_url}
//               alt={otherUser.full_name}
//               className="h-12 w-12 rounded-full object-cover"
//             />
//           ) : (
//             <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
//               <UserCircleIcon className="h-8 w-8 text-blue-600" />
//             </div>
//           )}
//         </div>

//         {/* Conversation Info */}
//         <div className="flex-1 min-w-0">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-1">
//             <div className="flex items-center space-x-2">
//               <h4 className="font-medium text-gray-900 truncate">
//                 {otherUser?.full_name || otherUser?.email || 'User'}
//               </h4>
              
//               {/* Verified badge */}
//               {otherUser?.is_verified && (
//                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
//                   Verified
//                 </span>
//               )}
//             </div>
            
//             {/* Time */}
//             <span className="text-xs text-gray-500 whitespace-nowrap">
//               {formatTime(lastMessageTime)}
//             </span>
//           </div>

//           {/* Apartment Info */}
//           <div className="mb-2">
//             <div className="flex items-center text-sm text-gray-600">
//               <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
//               <span className="truncate">{conversation.apartment?.title}</span>
//             </div>
//             <div className="flex items-center text-xs text-gray-500 mt-0.5">
//               <MapPinIcon className="h-3 w-3 mr-1" />
//               <span className="truncate">{conversation.apartment?.neighborhood || conversation.apartment?.city}</span>
//             </div>
//           </div>

//           {/* Last Message Preview */}
//           <div className="flex items-center justify-between">
//             <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
//               {lastMessage ? (
//                 <>
//                   <span className={lastMessage.sender_id === conversation.currentUserId ? 'text-blue-600' : ''}>
//                     {lastMessage.sender_id === conversation.currentUserId ? 'You: ' : ''}
//                   </span>
//                   {lastMessage.content.length > 40 
//                     ? `${lastMessage.content.substring(0, 40)}...` 
//                     : lastMessage.content}
//                 </>
//               ) : (
//                 'No messages yet'
//               )}
//             </p>

//             {/* Status Indicators */}
//             <div className="flex items-center space-x-2">
//               {/* Unread indicator */}
//               {hasUnread && (
//                 <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
//               )}
              
//               {/* Read receipt */}
//               {lastMessage?.sender_id === conversation.currentUserId && lastMessage?.is_read && (
//                 <CheckIcon className="h-4 w-4 text-green-500" />
//               )}
//             </div>
//           </div>

//           {/* Offer Status Badge */}
//           {activeOffer && (
//             <div className="mt-2">
//               <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                 activeOffer.status === 'accepted' 
//                   ? 'bg-green-100 text-green-800' 
//                   : activeOffer.status === 'pending'
//                   ? 'bg-yellow-100 text-yellow-800'
//                   : 'bg-gray-100 text-gray-800'
//               }`}>
//                 {activeOffer.status === 'accepted' && (
//                   <>
//                     <CheckIcon className="h-3 w-3 mr-1" />
//                     Offer Accepted
//                   </>
//                 )}
//                 {activeOffer.status === 'pending' && (
//                   <>
//                     <ClockIcon className="h-3 w-3 mr-1" />
//                     Offer Pending
//                   </>
//                 )}
//                 {commissionPaid && (
//                   <span className="ml-1">• 💰 Paid</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Touch Target */}
//       <div className="md:hidden absolute inset-0" aria-hidden="true" />
//     </div>
//   );
// };

// // Helper component for loading state
// export const ConversationCardSkeleton = () => {
//   return (
//     <div className="p-4 border-b border-gray-100">
//       <div className="flex items-start space-x-3 animate-pulse">
//         {/* Avatar skeleton */}
//         <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        
//         {/* Content skeleton */}
//         <div className="flex-1 space-y-2">
//           <div className="flex justify-between">
//             <div className="h-4 bg-gray-200 rounded w-1/3"></div>
//             <div className="h-3 bg-gray-200 rounded w-16"></div>
//           </div>
//           <div className="h-3 bg-gray-200 rounded w-full"></div>
//           <div className="h-3 bg-gray-200 rounded w-2/3"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConversationCard;



import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ConversationCard = ({ 
  conversation, 
  isActive = false,
  onClick 
}) => {
  // Determine other user based on current user's role
  const currentUserRole = conversation.currentUserRole;
  const otherUser = currentUserRole === 'tenant' 
    ? conversation.landlord 
    : conversation.tenant;

  // Get last message
  const lastMessage = conversation.messages?.[0];
  const lastMessageTime = lastMessage?.created_at 
    ? new Date(lastMessage.created_at) 
    : new Date(conversation.last_message_at);

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Check if there are unread messages
  const hasUnread = lastMessage && 
                    !lastMessage.is_read && 
                    lastMessage.sender_id !== conversation.currentUserId;

  // Check if there's an active offer
  const activeOffer = conversation.offers?.find(offer => 
    offer.status === 'accepted' || offer.status === 'pending'
  );

  // Check if commission is paid
  const commissionPaid = conversation.offers?.some(offer => 
    offer.commission_paid
  );

  // Handle click
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(conversation);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`block w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.full_name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">
                {otherUser?.full_name || otherUser?.email || 'User'}
              </h4>
              
              {/* Verified badge */}
              {otherUser?.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
            
            {/* Time */}
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(lastMessageTime)}
            </span>
          </div>

          {/* Apartment Info */}
          <div className="mb-2">
            <div className="flex items-center text-sm text-gray-600">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span className="truncate">{conversation.apartment?.title}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span className="truncate">{conversation.apartment?.neighborhood || conversation.apartment?.city}</span>
            </div>
          </div>

          {/* Last Message Preview */}
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
              {lastMessage ? (
                <>
                  <span className={lastMessage.sender_id === conversation.currentUserId ? 'text-blue-600' : ''}>
                    {lastMessage.sender_id === conversation.currentUserId ? 'You: ' : ''}
                  </span>
                  {lastMessage.content.length > 40 
                    ? `${lastMessage.content.substring(0, 40)}...` 
                    : lastMessage.content}
                </>
              ) : (
                'No messages yet'
              )}
            </p>

            {/* Status Indicators */}
            <div className="flex items-center space-x-2">
              {/* Unread indicator */}
              {hasUnread && (
                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
              )}
              
              {/* Read receipt */}
              {lastMessage?.sender_id === conversation.currentUserId && lastMessage?.is_read && (
                <CheckIcon className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Offer Status Badge */}
          {activeOffer && (
            <div className="mt-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activeOffer.status === 'accepted' 
                  ? 'bg-green-100 text-green-800' 
                  : activeOffer.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activeOffer.status === 'accepted' && (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Offer Accepted
                  </>
                )}
                {activeOffer.status === 'pending' && (
                  <>
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Offer Pending
                  </>
                )}
                {commissionPaid && (
                  <span className="ml-1">• 💰 Paid</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Touch Target */}
      <div className="md:hidden absolute inset-0" aria-hidden="true" />
    </div>
  );
};

// Helper component for loading state
export const ConversationCardSkeleton = () => {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-start space-x-3 animate-pulse">
        {/* Avatar skeleton */}
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;