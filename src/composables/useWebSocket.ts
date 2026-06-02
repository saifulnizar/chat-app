import { ref } from 'vue';
import { config } from '../config';
import type { WebSocketEvent, WebSocketAction } from '../types/chat';

export function useWebSocket(username: string) {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const lastEvent = ref<WebSocketEvent | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  let typingStopTimeout: number | null = null;
  let isTyping = false;
  let intentionalDisconnect = false;

  const connect = () => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      return;
    }

    intentionalDisconnect = false;

    try {
      const encodedMemberId = encodeURIComponent(username);
      const encodedAppId = encodeURIComponent(config.appId);
      const url = `${config.wsUrl}/ws?member_id=${encodedMemberId}&app_id=${encodedAppId}`;

      ws.value = new WebSocket(url);

      ws.value.onopen = () => {
        isConnected.value = true;
        reconnectAttempts.value = 0;
        subscribe();
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketEvent;
          lastEvent.value = data;
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        ws.value = null;

        if (intentionalDisconnect) {
          return;
        }

        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.value - 1);
          setTimeout(() => connect(), delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    intentionalDisconnect = true;

    if (typingStopTimeout) {
      clearTimeout(typingStopTimeout);
      typingStopTimeout = null;
    }
    isTyping = false;

    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
    isConnected.value = false;
    reconnectAttempts.value = 0;
  };

  const send = (action: WebSocketAction) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(action));
    }
  };

  const subscribe = () => {
    send({
      action: 'subscribe',
      channel_id: config.channelId,
    });
  };

  const sendTypingStart = () => {
    if (!isTyping) {
      isTyping = true;
      send({
        action: 'typing_start',
        channel_id: config.channelId,
      });
    }

    if (typingStopTimeout) {
      clearTimeout(typingStopTimeout);
    }

    typingStopTimeout = window.setTimeout(() => {
      sendTypingStop();
    }, 2000);
  };

  const sendTypingStop = () => {
    if (typingStopTimeout) {
      clearTimeout(typingStopTimeout);
      typingStopTimeout = null;
    }

    if (isTyping) {
      isTyping = false;
      send({
        action: 'typing_stop',
        channel_id: config.channelId,
      });
    }
  };

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
    sendTypingStart,
    sendTypingStop,
  };
}
