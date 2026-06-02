<template>
  <Transition name="fade">
    <div v-if="typingUsers.length > 0" class="flex items-center py-2 ml-3">
      <div class="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-2">
        <div class="flex gap-0.5">
          <span class="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full" style="animation-delay: 0ms"></span>
          <span class="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full" style="animation-delay: 200ms"></span>
          <span class="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full" style="animation-delay: 400ms"></span>
        </div>
        <span class="text-xs italic text-gray-600">
          {{ typingText }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  typingUsers: string[];
}>();

const typingText = computed(() => {
  if (props.typingUsers.length === 0) return '';
  if (props.typingUsers.length === 1) {
    return `${props.typingUsers[0]} is typing...`;
  }
  if (props.typingUsers.length === 2) {
    return `${props.typingUsers[0]} and ${props.typingUsers[1]} are typing...`;
  }
  return `${props.typingUsers.length} people are typing...`;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.typing-dot {
  animation: typing-dot 1.4s ease-in-out infinite;
}
</style>
