import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/NextAuthContext';

interface ChatMessage {
  _id: string;
  collaborationId: string;
  senderId: string;
  message: string;
  timestamp: string;
  edited: boolean;
  editedAt?: string;
  senderName: string;
  isCurrentUser?: boolean;
}

interface ChatInterfaceProps {
  collaborationId: string;
}

enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ collaborationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  
  const { user, getToken } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages
  const loadMessages = useCallback(async (silent = false) => {
    if (!user || !collaborationId) return;
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Backend already returns messages in chronological order (oldest first)
        // Ensure isCurrentUser is set for each message (in case backend doesn't set it)
        const messagesWithCurrentUser = data.map((message: ChatMessage) => ({
          ...message,
          isCurrentUser: message.isCurrentUser ?? (message.senderId === user?._id || message.senderId.toString() === user?._id?.toString())
        }));
        
        // Only update if messages have actually changed (prevent unnecessary re-renders)
        setMessages(prevMessages => {
          // Compare message counts and latest message IDs
          if (prevMessages.length !== messagesWithCurrentUser.length || 
              (messagesWithCurrentUser.length > 0 && prevMessages.length > 0 && 
               prevMessages[prevMessages.length - 1]?._id !== messagesWithCurrentUser[messagesWithCurrentUser.length - 1]?._id)) {
            
            if (!silent) {
              console.log(`📨 Updated messages: ${prevMessages.length} → ${messagesWithCurrentUser.length}`);
            }
            return messagesWithCurrentUser;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      if (!silent) {
        console.error('Error loading messages:', error);
      }
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  }, [user?._id, collaborationId, getToken]);

  // Check if WebSocket is supported (disable in production/serverless environments)
  const isWebSocketSupported = process.env.NODE_ENV === 'development';
  
  // WebSocket connection setup
  const connectWebSocket = useCallback(async () => {
    // Skip WebSocket connection in production (Vercel doesn't support it)
    if (!isWebSocketSupported) {
      console.log('🚫 WebSocket disabled in production environment');
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      return;
    }
    
    console.log('🔄 WebSocket Connection Attempt:', {
      hasUser: !!user,
      userId: user?._id,
      userName: user?.name,
      collaborationId,
      reconnectAttempt: reconnectAttempts.current
    });
    
    if (!user || !collaborationId) {
      console.log('❌ Cannot connect WebSocket: missing prerequisites', {
        hasUser: !!user,
        hasCollaborationId: !!collaborationId
      });
      return;
    }
    
    try {
      console.log('⏳ Setting connection status to CONNECTING...');
      setConnectionStatus(ConnectionStatus.CONNECTING);
      
      const token = await getToken();
      console.log('🔑 Retrieved token:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenStart: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      if (!token) {
        console.log('❌ No token available, cannot authenticate WebSocket');
        setConnectionStatus(ConnectionStatus.ERROR);
        return;
      }
      
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:5001/ws' 
        : `wss://${window.location.host}/ws`;
      
      console.log('🔗 Creating WebSocket connection to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected successfully');
        setConnectionStatus(ConnectionStatus.CONNECTED);
        reconnectAttempts.current = 0;
        
        const authMessage = {
          type: 'auth',
          token: token,
          collaborationId: collaborationId
        };
        
        console.log('📤 Sending authentication message:', {
          type: authMessage.type,
          collaborationId: authMessage.collaborationId,
          tokenLength: authMessage.token.length,
          fullMessage: authMessage
        });
        
        // Authenticate with the server
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        console.log('📥 WebSocket message received:', {
          rawData: event.data,
          timestamp: new Date().toISOString()
        });
        
        try {
          const data = JSON.parse(event.data);
          console.log('📋 Parsed WebSocket message:', data);
          
          if (data.type === 'auth_success') {
            console.log('✅ WebSocket authenticated successfully');
            setConnectionStatus(ConnectionStatus.CONNECTED);
          } else if (data.type === 'auth_error') {
            console.error('❌ WebSocket authentication failed:', {
              message: data.message,
              fullResponse: data
            });
            setConnectionStatus(ConnectionStatus.ERROR);
          } else if (data.type === 'new_message') {
            console.log('💬 New message received:', {
              messageId: data.message._id,
              senderName: data.message.senderName,
              content: data.message.message,
              fullMessage: data.message
            });
            
            // Add message only if it doesn't already exist (prevent duplicates)
            setMessages(prev => {
              const messageExists = prev.some(msg => msg._id === data.message._id);
              if (messageExists) {
                console.log('⚠️ Message already exists, skipping duplicate:', data.message._id);
                return prev;
              }
              
              // Set isCurrentUser based on senderId comparison
              const messageWithCurrentUser = {
                ...data.message,
                isCurrentUser: data.message.senderId === user?._id || data.message.senderId.toString() === user?._id?.toString()
              };
              

              
              return [...prev, messageWithCurrentUser];
            });
          } else if (data.type === 'error') {
            console.error('⚠️ WebSocket error message:', {
              message: data.message,
              fullResponse: data
            });
          } else {
            console.log('🤔 Unknown WebSocket message type:', data);
          }
        } catch (error) {
          console.error('💥 Error parsing WebSocket message:', {
            error: error instanceof Error ? error.message : String(error),
            rawData: event.data,
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
          user: user?.name,
          userId: user?._id,
          collaborationId
        });
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        wsRef.current = null;
        
        // Attempt to reconnect unless it was a clean close
        if (event.code !== 1000 && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`🔄 Attempting to reconnect in ${delay}ms...`, {
            attempt: reconnectAttempts.current + 1,
            maxAttempts: 5,
            delay,
            closeCode: event.code
          });
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        } else {
          console.log('🛑 Not reconnecting:', {
            code: event.code,
            isCleanClose: event.code === 1000,
            maxAttemptsReached: reconnectAttempts.current >= 5,
            attempts: reconnectAttempts.current
          });
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket client error:', {
          error,
          readyState: ws.readyState,
          url: ws.url,
          timestamp: new Date().toISOString(),
          user: user?.name,
          userId: user?._id,
          collaborationId
        });
        setConnectionStatus(ConnectionStatus.ERROR);
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
    }
  }, [user?._id, collaborationId, getToken, isWebSocketSupported]);

  // Initialize connection and load messages
  useEffect(() => {
    if (user && collaborationId) {
      loadMessages();
      
      // Only connect WebSocket in development
      if (isWebSocketSupported && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
        connectWebSocket();
      }
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [user?._id, collaborationId, connectWebSocket]); // Only user ID and collaboration ID
  
  // Polling for new messages in production (when WebSocket is not available)
  useEffect(() => {
    if (!isWebSocketSupported && user && collaborationId) {
      console.log('🔄 Starting message polling in production mode');
      
      // Poll more frequently for better real-time feel
      const pollInterval = setInterval(async () => {
        setIsPolling(true);
        await loadMessages(true); // Silent polling to avoid console spam
        setIsPolling(false);
      }, 2000); // Poll every 2 seconds
      
      return () => {
        console.log('🛑 Stopping message polling');
        clearInterval(pollInterval);
      };
    }
  }, [user?._id, collaborationId, loadMessages, isWebSocketSupported]);
  
  // Also poll immediately after sending a message in production
  const [lastMessageSent, setLastMessageSent] = useState<number>(0);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    // In production, skip WebSocket requirement check since we don't use WebSocket
    if (isWebSocketSupported && connectionStatus !== ConnectionStatus.CONNECTED) {
      return;
    }

    setIsSending(true);
    try {
      // Try WebSocket first if supported and connected
      if (isWebSocketSupported && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          content: newMessage.trim()
        }));
        setNewMessage('');
      } else {
        // Use HTTP API (either as fallback or primary method in production)
        throw new Error(isWebSocketSupported ? 'WebSocket not connected' : 'Using HTTP API in production');
      }
    } catch (error) {
      // Use HTTP API fallback
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: newMessage.trim() })
        });
        
        if (response.ok) {
          const newMessageData = await response.json();
          // Add message only if it doesn't already exist (prevent duplicates)
          setMessages(prev => {
            const messageExists = prev.some(msg => msg._id === newMessageData._id);
            if (messageExists) {
              console.log('⚠️ Fallback message already exists, skipping duplicate:', newMessageData._id);
              return prev;
            }
            
            // Ensure isCurrentUser is set for fallback messages
            const messageWithCurrentUser = {
              ...newMessageData,
              isCurrentUser: newMessageData.isCurrentUser ?? (newMessageData.senderId === user?._id || newMessageData.senderId.toString() === user?._id?.toString())
            };
            
            return [...prev, messageWithCurrentUser];
          });
          setNewMessage('');
          
          // In production, trigger immediate polling after sending
          if (!isWebSocketSupported) {
            setLastMessageSent(Date.now());
          }
        }
      } catch (fallbackError) {
        console.error('Fallback message sending failed:', fallbackError);
      }
    } finally {
      setIsSending(false);
    }
  };
  
  // Poll immediately after sending a message in production
  useEffect(() => {
    if (!isWebSocketSupported && lastMessageSent > 0) {
      const timeoutId = setTimeout(() => {
        loadMessages(true);
      }, 500); // Small delay to ensure message is saved on server
      
      return () => clearTimeout(timeoutId);
    }
  }, [lastMessageSent, loadMessages, isWebSocketSupported]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  const getConnectionStatusColor = () => {
    if (!isWebSocketSupported) {
      return 'bg-blue-500'; // Different color for HTTP mode
    }
    
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED: return 'bg-green-500';
      case ConnectionStatus.CONNECTING: return 'bg-yellow-500';
      case ConnectionStatus.ERROR: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    if (!isWebSocketSupported) {
      return 'Auto-Sync'; // Production mode with polling
    }
    
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED: return 'Connected';
      case ConnectionStatus.CONNECTING: return 'Connecting...';
      case ConnectionStatus.ERROR: return 'Connection error';
      default: return 'Disconnected';
    }
  };

  // Dynamic height based on message count
  const getMessageCount = () => messages.length;
  const getHeightClass = () => {
    const messageCount = getMessageCount();
    if (messageCount === 0) return 'h-64'; // Small for empty chat
    if (messageCount < 5) return 'h-80'; // Medium for few messages  
    if (messageCount < 15) return 'h-96'; // Default for moderate messages
    if (messageCount < 30) return 'h-[32rem]'; // Large for many messages
    return 'h-[40rem]'; // Extra large for lots of messages
  };

  return (
    <div className={`flex flex-col ${getHeightClass()} bg-white rounded-lg border border-gray-200`}>
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Chat</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()} ${isPolling ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs text-gray-500">
              {getConnectionStatusText()}
              {isPolling && !isWebSocketSupported && (
                <span className="ml-1 text-blue-600">•</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center py-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                    {date}
                  </span>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message: ChatMessage) => {
                  // Use isCurrentUser from message if available, otherwise compute it
                  const isCurrentUser = message.isCurrentUser ?? (message.senderId === user?._id || message.senderId.toString() === user?._id?.toString());
                  


                  
                  return (
                    <div
                      key={message._id}
                      className={`w-full flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                      }`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          isCurrentUser ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {isCurrentUser ? 'You' : (message.senderName || 'U').charAt(0)}
                        </div>
                        
                        {/* Message bubble */}
                        <div className="flex flex-col">
                          {!isCurrentUser && (
                            <div className="text-xs font-medium text-gray-600 mb-1 px-1">
                              {message.senderName || 'Unknown User'}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            <div className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.timestamp)}
                              {message.edited && <span className="ml-1">(edited)</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1 text-gray-400">Start the conversation!</p>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending || (isWebSocketSupported && connectionStatus !== ConnectionStatus.CONNECTED)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || (isWebSocketSupported && connectionStatus !== ConnectionStatus.CONNECTED)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        
        {isWebSocketSupported && connectionStatus !== ConnectionStatus.CONNECTED && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              {connectionStatus === ConnectionStatus.CONNECTING ? 'Connecting to chat...' : 'Chat unavailable - messages will be sent when reconnected'}
            </span>
          </div>
        )}
        
        {!isWebSocketSupported && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              Auto-refreshing every 2 seconds - new messages appear automatically
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 