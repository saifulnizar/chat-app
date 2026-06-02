<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto px-2 sm:px-4 py-6 bg-gray-100">
    <div class="max-w-6xl mx-auto space-y-1">
      <TransitionGroup name="slide-up">
        <MessageItem
          v-for="message in messages"
          :key="message.message_id"
          :message="message"
          :current-username="currentUsername"
        />
      </TransitionGroup>

      <TypingIndicator :typing-users="typingUsers" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Message } from '../types/chat';
import MessageItem from './MessageItem.vue';
import TypingIndicator from './TypingIndicator.vue';

const props = defineProps<{
  messages: Message[];
  typingUsers: string[];
  currentUsername: string;
}>();

const scrollContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
};

// Auto-scroll when new messages arrive
watch(() => props.messages.length, () => {
  scrollToBottom();
}, { flush: 'post' });

// Initial scroll
watch(() => props.messages, () => {
  if (props.messages.length > 0) {
    scrollToBottom();
  }
}, { immediate: true, flush: 'post' });
</script>

<style scoped>
.slide-up-move,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 300ms ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-up-leave-active {
  position: absolute;
  width: 100%;
}
</style>
