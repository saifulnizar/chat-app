<template>
  <div class="h-screen bg-gray-100 flex">
    <!-- Sidebar - Chat List Card -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <!-- Sidebar Header -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-zinc-900">Chats</h2>
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div class="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-zinc-900">{{ channelInfo?.name || 'Loading...' }}</p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-1 truncate">{{ channelInfo?.lastMessageText || 'No messages yet' }}</p>
            </div>
            <span class="text-xs text-gray-400">
              {{ channelInfo?.lastMessageAt 
                ? new Date(channelInfo.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
                : '' 
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="sticky bottom-0 border-t border-gray-200 bg-white p-3">
        <button
          @click="handleLogout"
          class="w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat Header Card -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-zinc-900">{{ channelInfo?.name || 'Loading...' }}</h1>
            <div class="flex items-center gap-1 mt-1">
              <span class="text-sm text-gray-500">{{ channelInfo?.memberCount ?? '...' }} members</span>
              <!-- <span class="relative flex h-2 w-2">
                <span
                  v-if="isConnected"
                  class="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"
                  style="animation: pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
                ></span>
                <span
                  :class="[
                    'relative inline-flex rounded-full h-2 w-2',
                    isConnected ? 'bg-emerald-500' : 'bg-red-500'
                  ]"
                ></span>
              </span> -->
              <!-- <span class="text-sm text-gray-500">2 online</span> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Message List -->
      <MessageList
        :messages="messages"
        :typing-users="typingUsers"
        :current-username="username"
      />

      <!-- Input Area -->
      <div class="bg-white border-t border-gray-200 px-6 py-4">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-3">
      
          <div class="relative">
            <button
              ref="emojiButtonRef"
              type="button"
              @click="showEmojiPicker = !showEmojiPicker"
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-zinc-900 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </button>

            <!-- Emoji Picker -->
            <div v-if="showEmojiPicker" class="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                :native="true"
                @select="onSelectEmoji"
              />
            </div>
          </div>

          <input
            v-model="inputMessage"
            type="text"
            placeholder="Type your message"
            autocomplete="off"
            class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-zinc-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900/20 transition-all duration-200"
            @input="handleInput"
            @keydown.enter.prevent="handleEnterKey"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || !isConnected"
            class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full transition-all duration-200 hover:shadow-md hover:shadow-zinc-900/25 active:scale-95 focus:outline-none"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import MessageList from './MessageList.vue';
import type { Message } from '../types/chat';
import EmojiPicker from 'vue3-emoji-picker';

const props = defineProps<{
  username: string;
  messages: Message[];
  typingUsers: string[];
  isConnected: boolean;
  channelInfo: { 
    name: string; 
    description:string; 
    memberCount: number, 
    messageCount:number, 
    lastMessageAt:string | null, 
    lastMessageText:string | null, 
  } | null;
}>();


const emit = defineEmits<{
  logout: [];
  sendMessage: [text: string];
  typingStart: [];
  typingStop: [];
}>();

const inputMessage = ref('');
const showEmojiPicker = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const emojiButtonRef = ref<HTMLButtonElement | null>(null);

// const onSelectEmoji = (emoji: { i: string }) => {
//   inputMessage.value += emoji.i;
//   showEmojiPicker.value = false;
// };

  const onSelectEmoji = (emoji: { i: string }) => {
    const input = inputRef.value;
    if (!input) {
      inputMessage.value += emoji.i;
      return;
    }
   
    const start = input.selectionStart ?? inputMessage.value.length;
    const end = input.selectionEnd ?? inputMessage.value.length;
   
    inputMessage.value =
      inputMessage.value.slice(0, start) +
      emoji.i +
      inputMessage.value.slice(end);
   
    nextTick(() => {
      input.focus();
      const newPos = start + emoji.i.length;
      input.setSelectionRange(newPos, newPos);
    });
   
    showEmojiPicker.value = false;
  };

const handleClickOutside = (e: MouseEvent) => {
  const picker = document.querySelector('.v3-emoji-picker');
  const button = emojiButtonRef.value;
 
  if (
    picker?.contains(e.target as Node) ||
    button?.contains(e.target as Node)
  ) return;
 
  showEmojiPicker.value = false;
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

const handleLogout = () => {
  emit('logout');
};

const handleSendMessage = () => {
  if (inputMessage.value.trim() && props.isConnected) {
    emit('sendMessage', inputMessage.value.trim());
    inputMessage.value = '';
    emit('typingStop');
  }
};

const handleInput = () => {
  emit('typingStart');
};

const handleEnterKey = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    handleSendMessage();
  }
};
</script>
