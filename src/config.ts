export const config = {
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:9002',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:9001',
  channelId: import.meta.env.VITE_CHANNEL_ID || '',
  appId: import.meta.env.VITE_APP_ID || 'default',
};

// Validate required environment variables
if (!config.channelId) {
  throw new Error('VITE_CHANNEL_ID is required');
}
