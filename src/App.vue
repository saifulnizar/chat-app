<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import LoginScreen from './components/LoginScreen.vue';
import ChatRoom from './components/ChatRoom.vue';
import { useChat } from './composables/useChat';

const username = ref<string | null>(null);
const showLogin = ref(true);
let chatComposable: ReturnType<typeof useChat> | null = null;

// Computed properties to safely access composable state
const messages = computed(() => chatComposable?.messages.value || []);
const typingUsers = computed(() => chatComposable?.typingUsers.value || []);
const isConnected = computed(() => chatComposable?.isConnected.value || false);
const channelInfo = computed(() => chatComposable?.channelInfo.value || null);

onMounted(() => {
  // Check localStorage for existing username
  const savedUsername = localStorage.getItem('chat_username');
  if (savedUsername) {
    username.value = savedUsername;
    showLogin.value = false;
    // Initialize chat for returning user
    initializeChat(savedUsername, false);
  }
});

const initializeChat = (newUsername: string, isNewUser: boolean) => {
  chatComposable = useChat(newUsername, isNewUser);
  chatComposable.initialize();
};

const handleLogin = (newUsername: string) => {
  username.value = newUsername;
  localStorage.setItem('chat_username', newUsername);
  showLogin.value = false;
  // Initialize chat for new user
  initializeChat(newUsername, true);
};

const handleLogout = () => {
  // Disconnect WebSocket
  if (chatComposable) {
    chatComposable.disconnect();
  }
  
  username.value = null;
  localStorage.removeItem('chat_username');
  showLogin.value = true;
  chatComposable = null;
};

const handleSendMessage = (text: string) => {
  if (chatComposable) {
    chatComposable.sendMessage(text);
  }
};

const handleTypingStart = () => {
  if (chatComposable) {
    chatComposable.sendTypingStart();
  }
};

const handleTypingStop = () => {
  if (chatComposable) {
    chatComposable.sendTypingStop();
  }
};

// Cleanup on unmount
onUnmounted(() => {
  if (chatComposable) {
    chatComposable.disconnect();
  }
});
</script>

<template>
  <LoginScreen v-if="showLogin" @login="handleLogin" />
  <ChatRoom
    v-else
    :channel-info="channelInfo"
    :username="username!"
    :messages="messages"
    :typing-users="typingUsers"
    :is-connected="isConnected"
    @logout="handleLogout"
    @send-message="handleSendMessage"
    @typing-start="handleTypingStart"
    @typing-stop="handleTypingStop"
  />
</template>
