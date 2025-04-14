import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl, getToken } from './api';
import { ChatMessage } from './api';

type MessageHandler = (message: ChatMessage) => void;
type OnlineStatusHandler = (userId: string, isOnline: boolean) => void;
type TypingStatusHandler = (userId: string, isTyping: boolean) => void;
type MessageReadHandler = (conversationId: string, readerId: string) => void;
type ConnectionStatusHandler = (connected: boolean) => void;

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private onlineStatusHandlers: OnlineStatusHandler[] = [];
  private typingStatusHandlers: TypingStatusHandler[] = [];
  private messageReadHandlers: MessageReadHandler[] = [];
  private connectionStatusHandlers: ConnectionStatusHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async initialize(userId: string): Promise<boolean> {
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return true;
    }

    const token = await getToken();
    if (!token) {
      console.error('No authentication token available');
      return false;
    }

    this.userId = userId;
    
    try {
      const apiUrl = getApiBaseUrl();
      this.socket = io(apiUrl, {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Error initializing socket connection:', error);
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      
      // Join user's personal room to receive messages
      if (this.userId) {
        this.socket.emit('join', { user_id: this.userId });
      }
      
      this.notifyConnectionStatusChange(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.notifyConnectionStatusChange(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached, giving up');
        this.socket?.disconnect();
      }
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      console.log('New message received:', message);
      this.notifyMessageReceived(message);
    });

    this.socket.on('user_online', (data: { user_id: string }) => {
      console.log('User came online:', data.user_id);
      this.notifyOnlineStatusChange(data.user_id, true);
    });

    this.socket.on('user_offline', (data: { user_id: string }) => {
      console.log('User went offline:', data.user_id);
      this.notifyOnlineStatusChange(data.user_id, false);
    });

    this.socket.on('user_typing', (data: { user_id: string }) => {
      console.log('User is typing:', data.user_id);
      this.notifyTypingStatusChange(data.user_id, true);
    });

    this.socket.on('user_stop_typing', (data: { user_id: string }) => {
      console.log('User stopped typing:', data.user_id);
      this.notifyTypingStatusChange(data.user_id, false);
    });

    this.socket.on('messages_read', (data: { conversation_id: string, reader_id: string }) => {
      console.log('Messages marked as read:', data);
      this.notifyMessagesRead(data.conversation_id, data.reader_id);
    });
  }

  disconnect() {
    if (this.socket) {
      if (this.userId) {
        this.socket.emit('leave', { user_id: this.userId });
      }
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  sendMessage(message: string, recipientId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot send message');
      return false;
    }

    // Messages are sent via the REST API, but we can use this for typing indicators
    return true;
  }

  sendTypingStatus(isTyping: boolean, recipientId: string) {
    if (!this.socket || !this.socket.connected || !this.userId) {
      return false;
    }

    this.socket.emit(
      isTyping ? 'typing' : 'stop_typing', 
      { 
        user_id: this.userId, 
        recipient_id: recipientId 
      }
    );
    return true;
  }

  // Event listener registration methods
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onOnlineStatusChange(handler: OnlineStatusHandler) {
    this.onlineStatusHandlers.push(handler);
    return () => {
      this.onlineStatusHandlers = this.onlineStatusHandlers.filter(h => h !== handler);
    };
  }

  onTypingStatusChange(handler: TypingStatusHandler) {
    this.typingStatusHandlers.push(handler);
    return () => {
      this.typingStatusHandlers = this.typingStatusHandlers.filter(h => h !== handler);
    };
  }

  onMessagesRead(handler: MessageReadHandler) {
    this.messageReadHandlers.push(handler);
    return () => {
      this.messageReadHandlers = this.messageReadHandlers.filter(h => h !== handler);
    };
  }

  onConnectionStatusChange(handler: ConnectionStatusHandler) {
    this.connectionStatusHandlers.push(handler);
    return () => {
      this.connectionStatusHandlers = this.connectionStatusHandlers.filter(h => h !== handler);
    };
  }

  // Notification methods
  private notifyMessageReceived(message: ChatMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyOnlineStatusChange(userId: string, isOnline: boolean) {
    this.onlineStatusHandlers.forEach(handler => handler(userId, isOnline));
  }

  private notifyTypingStatusChange(userId: string, isTyping: boolean) {
    this.typingStatusHandlers.forEach(handler => handler(userId, isTyping));
  }

  private notifyMessagesRead(conversationId: string, readerId: string) {
    this.messageReadHandlers.forEach(handler => handler(conversationId, readerId));
  }

  private notifyConnectionStatusChange(connected: boolean) {
    this.connectionStatusHandlers.forEach(handler => handler(connected));
  }

  // Status methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export a singleton instance
export const socketService = new SocketService();
export default socketService; 