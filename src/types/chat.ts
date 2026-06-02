export interface Message {
  message_id: string;
  channel_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export interface WebSocketEvent {
  event_type: 'created' | 'typing_start' | 'typing_stop' | 'delivered' | 'read';
  app_id?: string;
  channel_id: string;
  sender_id?: string;
  message_id?: string;
  text?: string;
  created_at?: string;
  member_id?: string;
  user_id?: string;
  delivered_at?: string;
  read_at?: string;
}

export interface WebSocketAction {
  action: 'subscribe' | 'unsubscribe' | 'typing_start' | 'typing_stop';
  channel_id: string;
}

export interface ChatState {
  username: string;
  messages: Message[];
  typingUsers: string[];
  isConnected: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface SendMessageRequest {
  sender_id: string;
  text: string;
  attachments?: string[];
  extra_data?: Record<string, string>;
}

export interface AddMemberRequest {
  member_id: string;
  role: 'member' | 'admin' | 'moderator';
}

export interface MessageStatus {
  delivered_to: string[];
  not_delivered: string[];
  read_by: string[];
}
