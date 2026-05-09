

// // services/socket.service.js - FIXED VERSION
// import { io } from 'socket.io-client';

// class SocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = new Map();
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//     this.typingTimeouts = new Map(); // ✅ FIXED: Regular property, not TypeScript
//   }

//   // Connect to socket.io server
//   connect(token) {
//     // const token = getToken();

//     if (!token) {
//       console.error('❌ No authentication token available');
//       return;
//     }

//     if (this.socket?.connected) {
//       console.log('✅ Socket already connected');
//       return;
//     }

//     // Create socket connection
//     this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
//       auth: { token },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: this.maxReconnectAttempts,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 20000
//     });

//     // Socket event handlers
//     this.socket.on('connect', () => {
//       console.log('🔌 Socket.io connected:', this.socket.id);
//       this.reconnectAttempts = 0;
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('❌ Socket connection error:', error.message);
//       this.reconnectAttempts++;

//       if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.error('Max reconnection attempts reached');
//       }
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log('🔌 Socket disconnected:', reason);
//     });

//     // Auto-reconnect
//     this.socket.on('reconnect_attempt', (attemptNumber) => {
//       console.log(`🔄 Reconnect attempt ${attemptNumber}`);
//     });

//     this.socket.on('reconnect', (attemptNumber) => {
//       console.log(`✅ Reconnected after ${attemptNumber} attempts`);
//     });
//   }

//   // Disconnect socket
//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       console.log('🔌 Socket disconnected');
//     }
//   }

//   // Join conversation room
//   joinConversation(conversationId) {
//     if (!this.socket?.connected) {
//       this.connect();
//     }

//     if (this.socket) {
//       this.socket.emit('join_conversation', { conversationId });
//       console.log(`📨 Joined conversation room: ${conversationId}`);
//     }
//   }

//   // Leave conversation room
//   leaveConversation(conversationId) {
//     if (this.socket) {
//       this.socket.emit('leave_conversation', { conversationId });
//       console.log(`👋 Left conversation room: ${conversationId}`);
//     }
//   }

//   // Improved typing indicator with better timing
//   sendTyping(conversationId, isTyping) {
//     if (!this.socket?.connected) return;

//     // Clear any existing timeout for this conversation
//     if (this.typingTimeouts.has(conversationId)) {
//       clearTimeout(this.typingTimeouts.get(conversationId));
//       this.typingTimeouts.delete(conversationId);
//     }

//     // Send typing event immediately
//     this.socket.emit('typing', { conversationId, isTyping });

//     // If we're starting to type, set a timeout to stop typing after 2 seconds of inactivity
//     if (isTyping) {
//       const timeoutId = setTimeout(() => {
//         this.sendTyping(conversationId, false);
//       }, 2000);

//       this.typingTimeouts.set(conversationId, timeoutId);
//     }
//   }

//   // Send message read receipt
//   sendMessageRead(conversationId, messageId) {
//     if (this.socket?.connected) {
//       this.socket.emit('mark_as_read', { conversationId, messageId });
//     }
//   }

//   // Listen for events
//   on(event, callback) {
//     if (!this.socket) {
//       this.connect();
//     }

//     this.socket?.on(event, callback);

//     // Store listener for cleanup
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }
//     this.listeners.get(event).push(callback);
//   }

//   // Remove event listener
//   off(event, callback) {
//     if (this.socket) {
//       if (callback) {
//         this.socket.off(event, callback);
//       } else {
//         this.socket.off(event);
//       }
//     }

//     // Clean up stored listeners
//     if (this.listeners.has(event)) {
//       if (callback) {
//         const filtered = this.listeners.get(event).filter(cb => cb !== callback);
//         this.listeners.set(event, filtered);
//       } else {
//         this.listeners.delete(event);
//       }
//     }
//   }

//   // Check if connected
//   isConnected() {
//     return this.socket?.connected || false;
//   }

//   // Get socket instance
//   getSocket() {
//     return this.socket;
//   }

//   // Clean up all listeners and timeouts
//   cleanup() {
//     // Clear all typing timeouts
//     this.typingTimeouts.forEach((timeoutId, conversationId) => {
//       clearTimeout(timeoutId);
//     });
//     this.typingTimeouts.clear();

//     // Clear all event listeners
//     if (this.socket) {
//       this.listeners.forEach((callbacks, event) => {
//         callbacks.forEach(callback => {
//           this.socket.off(event, callback);
//         });
//       });
//       this.listeners.clear();
//     }
//   }

//   // Offer events
//   sendOfferEvent(eventName, data) {
//     if (this.socket?.connected) {
//       this.socket.emit(eventName, data);
//     }
//   }

//   // Listen for offer events
//   onOfferAccepted(callback) {
//     this.on('offer_accepted', callback);
//   }

//   onOfferRejected(callback) {
//     this.on('offer_rejected', callback);
//   }

//   onNewOffer(callback) {
//     this.on('new_offer', callback);
//   }

//   onCommissionPaid(callback) {
//     this.on('commission_paid', callback);
//   }

// }



// // Create singleton instance
// const socketService = new SocketService();

// export default socketService;



// services/socket.service.js - FULLY UPDATED
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.typingTimeouts = new Map();
    this.conversationRooms = new Set();
  }

  // Connect to socket.io server
  connect(token) {
    if (!token) {
      console.error('❌ No authentication token available');
      return;
    }

    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    // Create socket connection
    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Socket event handlers
    this.socket.on('connect', () => {
      console.log('🔌 Socket.io connected:', this.socket.id);
      this.reconnectAttempts = 0;
      
      // Rejoin all conversation rooms after reconnect
      this.conversationRooms.forEach(roomId => {
        this.joinConversation(roomId);
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // Auto-reconnect
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.conversationRooms.clear();
      console.log('🔌 Socket disconnected');
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }

    this.socket.emit('join_conversation', { conversationId });
    this.conversationRooms.add(conversationId);
    console.log(`📨 Joined conversation room: ${conversationId}`);
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
    this.conversationRooms.delete(conversationId);
    console.log(`👋 Left conversation room: ${conversationId}`);
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    if (!this.socket?.connected) return;

    // Clear any existing timeout for this conversation
    if (this.typingTimeouts.has(conversationId)) {
      clearTimeout(this.typingTimeouts.get(conversationId));
      this.typingTimeouts.delete(conversationId);
    }

    // Send typing event
    this.socket.emit('typing', { 
      conversationId, 
      isTyping,
      timestamp: Date.now()
    });

    // If we're starting to type, set a timeout to stop typing after inactivity
    if (isTyping) {
      const timeoutId = setTimeout(() => {
        this.sendTyping(conversationId, false);
      }, 2000);
      this.typingTimeouts.set(conversationId, timeoutId);
    }
  }

  // Send message read receipt
  sendMessageRead(conversationId, messageId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', { conversationId, messageId });
    }
  }

  // EMIT OFFER EVENTS
  emitOfferCreated(conversationId, offer) {
    if (this.socket?.connected) {
      this.socket.emit('new_offer', { conversationId, offer });
    }
  }

  emitOfferAccepted(conversationId, offer) {
    if (this.socket?.connected) {
      this.socket.emit('offer_accepted', { conversationId, offer });
    }
  }

  emitOfferRejected(conversationId, offer) {
    if (this.socket?.connected) {
      this.socket.emit('offer_rejected', { conversationId, offer });
    }
  }

  emitOfferCountered(conversationId, offer) {
    if (this.socket?.connected) {
      this.socket.emit('offer_countered', { conversationId, offer });
    }
  }

  emitOfferWithdrawn(conversationId, offerId) {
    if (this.socket?.connected) {
      this.socket.emit('offer_withdrawn', { conversationId, offerId });
    }
  }

  // Listen for events
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
    
    // Clean up stored listeners
    if (this.listeners.has(event)) {
      if (callback) {
        const filtered = this.listeners.get(event).filter(cb => cb !== callback);
        this.listeners.set(event, filtered);
      } else {
        this.listeners.delete(event);
      }
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Clean up all listeners and timeouts
  cleanup() {
    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.typingTimeouts.clear();
    
    // Clear all event listeners
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
    
    this.conversationRooms.clear();
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;