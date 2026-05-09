import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import ConversationList from '../components/chats/ConversationList';
import ChatWindow from '../components/chats/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftIcon, 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation,
    loadConversations,
    loading 
  } = useChat();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const otherUser = user?.role === 'tenant' 
      ? conv.landlord 
      : conv.tenant;
    
    const apartmentTitle = conv.apartment?.title || '';
    const userName = otherUser?.full_name || otherUser?.email || '';
    
    return apartmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    if (isMobile) {
      navigate(`/chat/${conversation.id}`);
    }
  };

  // Handle back to list (mobile)
  const handleBackToList = () => {
    setActiveConversation(null);
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
          
          {/* Sidebar - Conversation List */}
          <div className={`${isMobile && activeConversation ? 'hidden' : 'flex'} 
                          flex-col w-full md:w-96 border-r border-gray-200`}>
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search conversations..."
                />
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No conversations yet</p>
                  <p className="text-sm text-gray-400">
                    Start by contacting a landlord about a property
                  </p>
                </div>
              ) : (
                <ConversationList 
                  conversations={filteredConversations}
                  onSelectConversation={handleSelectConversation}
                  activeConversationId={activeConversation?.id}
                />
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col ${isMobile && !activeConversation ? 'hidden' : ''}`}>
            {activeConversation ? (
              <>
                {/* Mobile back button */}
                {isMobile && (
                  <button
                    onClick={handleBackToList}
                    className="md:hidden flex items-center gap-2 p-4 border-b border-gray-200 text-blue-600 hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span className="font-medium">Back to conversations</span>
                  </button>
                )}
                
                <ChatWindow 
                  conversation={activeConversation}
                  user={user}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-md text-center">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 mb-8">
                    Choose a conversation from the list to start chatting with landlords or tenants
                  </p>
                  
                  {conversations.length === 0 && (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Browse properties and click "Contact Landlord" to start your first conversation
                      </p>
                      <button
                        onClick={() => navigate('/search')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;