import { ref, watch } from 'vue';
import { config } from '../config';
import { useWebSocket } from './useWebSocket';
import type { Message, ApiResponse, ApiError, SendMessageRequest, AddMemberRequest } from '../types/chat';

export function useChat(username: string, isNewUser: boolean) {
  const messages = ref<Message[]>([]);
  const typingUsers = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const channelInfo = ref<{ 
    name: string; 
    memberCount: number, 
    description:string, 
    messageCount:number,  
    lastMessageAt:string | null ,
    lastMessageText:string | null ,
  } | null>(null);

  const { isConnected, lastEvent, connect, disconnect, sendTypingStart, sendTypingStop } = useWebSocket(username);

  // API helper function
  const apiCall = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': config.appId,
          ...options.headers,
        },
      });

      const data = await response.json() as ApiResponse<T> | ApiError;

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.error?.message || 'API request failed');
      }

      return (data as ApiResponse<T>).data;
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  const loadChannel = async () => {
    try {
      const url = `${config.apiUrl}/api/v1/channels/${config.channelId}`;
      const data = await apiCall<{
        name: string;
        description: string;
        member_count: number;
        message_count: number;
        last_message_at: string;
      }>(url, { method: 'GET' });

      channelInfo.value = {
        name: data.name,
        description: data.description,
        memberCount: data.member_count,
        messageCount : data.member_count,
        lastMessageAt : data.last_message_at ?? null,
        lastMessageText: null

      };
    } catch (err) {
      console.error('Failed to load channel:', err);
    }
  };

  // Add member to channel (for new users only)
  const addMember = async () => {
    try {
      console.log('Adding member to channel:', username);
      const url = `${config.apiUrl}/api/v1/channels/${config.channelId}/members`;
      const body: AddMemberRequest = {
        member_id: username,
        role: 'member',
      };

      await apiCall<{ message: string }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      console.log('Member added successfully');
    } catch (err) {
      console.error('Failed to add member:', err);
      error.value = err instanceof Error ? err.message : 'Failed to add member';
      throw err;
    }
  };

  // Load message history
  const loadHistory = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      console.log('Loading message history');
      const url = `${config.apiUrl}/api/v1/channels/${config.channelId}/messages?limit=50`;
      const history = await apiCall<Message[]>(url, {
        method: 'GET',
      });

      messages.value = history;

      if (channelInfo.value && history.length > 0) {
        const last = history[history.length - 1];
        channelInfo.value.lastMessageText = last.sender_id && last.text ? `${last.sender_id}: ${last.text}` : null;
      }

      console.log('Message history loaded:', history.length, 'messages');
    } catch (err) {
      console.error('Failed to load history:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load message history';
    } finally {
      isLoading.value = false;
    }
  };

  // Send message
  const sendMessage = async (text: string) => {
    try {
      error.value = null;

      console.log('Sending message:', text);
      const url = `${config.apiUrl}/api/v1/channels/${config.channelId}/messages`;
      const body: SendMessageRequest = {
        sender_id: username,
        text,
        attachments: [],
        extra_data: {},
      };

      const message = await apiCall<Message>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      console.log('Message sent successfully:', message.message_id);
      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      throw err;
    }
  };

  // Initialize connection
  const initialize = async () => {
    try {
      if (isNewUser) {
        // New user: add member first, then connect
        await addMember();
      }

      // Connect WebSocket
      connect();

      // Load message history
      
      await loadChannel();
      await loadHistory();

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      error.value = err instanceof Error ? err.message : 'Failed to initialize chat';
    }
  };

  // Watch for WebSocket events
  watch(lastEvent, (event) => {
    if (!event) return;

    console.log('Processing WebSocket event:', event.event_type);

    switch (event.event_type) {
      case 'created':
        // New message received
        if (event.message_id && event.text && event.sender_id && event.created_at) {
          const newMessage: Message = {
            message_id: event.message_id,
            channel_id: event.channel_id,
            sender_id: event.sender_id,
            text: event.text,
            created_at: event.created_at,
          };

          // Check for duplicates before adding
          const exists = messages.value.some(m => m.message_id === newMessage.message_id);
          if (!exists) {
            messages.value.push(newMessage);
            console.log('New message added:', newMessage.message_id);

            if (channelInfo.value) {
              channelInfo.value.messageCount++;
            }

            if (channelInfo.value) {
              channelInfo.value.lastMessageAt = event.created_at;
              channelInfo.value.lastMessageText = event.sender_id && event.text ? `${event.sender_id}: ${event.text}` : null;
            }


          }

        }
        break;

      case 'typing_start':
        // User started typing
        if (event.member_id && event.member_id !== username) {
          if (!typingUsers.value.includes(event.member_id)) {
            typingUsers.value.push(event.member_id);
            console.log('User started typing:', event.member_id);
          }
        }
        break;

      case 'typing_stop':
        // User stopped typing
        if (event.member_id) {
          typingUsers.value = typingUsers.value.filter(id => id !== event.member_id);
          console.log('User stopped typing:', event.member_id);
        }
        break;

      case 'delivered':
        if (event.message_id && event.user_id) {
          console.log('Message delivered:', event.message_id, 'to:', event.user_id);
        }
        break;

      case 'read':
        if (event.message_id && event.user_id) {
          console.log('Message read:', event.message_id, 'by:', event.user_id);
        }
        break;

      case 'added':
        if (event.member_id) {
          if (channelInfo.value) {
            channelInfo.value.memberCount++;
          }
          console.log('Member added:', event.member_id);
        }
        break;

      default:
        console.log('Unknown event type:', event.event_type);
    }
  });

  return {
    messages,
    typingUsers,
    isConnected,
    isLoading,
    error,
    initialize,
    disconnect,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    channelInfo,
  };
}
