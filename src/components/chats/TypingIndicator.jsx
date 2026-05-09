
import React from 'react';

const TypingIndicator = ({ userName = 'Someone' }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md rounded-lg rounded-bl-none bg-gray-100 p-3">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">{userName} is typing...</span>
        </div>
      </div>
    </div>
  );
};

// Alternative: Bubble style
export const BubbleTypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md rounded-lg rounded-bl-none bg-gray-100 p-4">
        <div className="flex items-center justify-center space-x-1">
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;