<template>
  <!-- System message -->
  <div v-if="isSystemMessage" class="flex justify-center py-2">
    <div class="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-full text-center">
      {{ message.text }}
    </div>
  </div>

  <!-- Regular message -->
  <div v-else :class="['flex w-full gap-3 py-2', isOwnMessage ? 'justify-end' : 'justify-start']">
    <!-- Avatar for other users -->
    <div v-if="!isOwnMessage" class="flex-shrink-0 pt-1">
      <span class="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-semibold text-white">
        {{ message.sender_id.charAt(0).toUpperCase() }}
      </span>
    </div>

    <!-- Message bubble for others -->
    <div v-if="!isOwnMessage" class="max-w-[65%] sm:max-w-[55%]">
      <div class="bg-white text-zinc-900 px-4 py-2 rounded-2xl rounded-tl-sm relative shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <p class="text-sm font-semibold mb-1">{{ message.sender_id }}</p>
            <div class="flex items-start justify-between gap-5">
              <div class="flex-1">
              <p class="text-sm leading-relaxed break-words">{{ message.text }}</p>
            </div>
              <span class="text-xs text-gray-500 flex-shrink-0 pt-2">{{ formattedTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Own message (right aligned) -->
    <div v-else class="max-w-[65%] sm:max-w-[55%]">
      <div class="bg-zinc-900 text-white px-4 py-3 rounded-2xl rounded-tr-sm relative shadow-sm">
        <div class="flex items-start justify-between gap-5">
          <p class="text-sm leading-relaxed break-words flex-1">{{ message.text }}</p>
          <span class="text-xs text-gray-300 flex-shrink-0 pt-2">{{ formattedTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../types/chat';

const props = defineProps<{
  message: Message;
  currentUsername: string;
}>();

const isOwnMessage = computed(() => props.message.sender_id === props.currentUsername);

const isSystemMessage = computed(() => {
  const text = props.message.text.toLowerCase();
  return text.includes('has joined') || text.includes('has left');
});

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
});
</script>
