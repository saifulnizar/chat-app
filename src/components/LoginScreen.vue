<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Subtle background texture -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-zinc-100/80 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-zinc-100/60 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-sm">
      <!-- Card -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/60 overflow-hidden">
        <!-- Accent bar: solid black -->
        <div class="h-1 bg-zinc-900"></div>

        <div class="p-8 pt-10">
          <!-- Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-300/60">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
          </div>

          <!-- Text -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">Welcome back</h1>
            <p class="text-sm text-zinc-400 mt-2">Enter your username to start chatting</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <input
                v-model="username"
                type="text"
                placeholder="Username"
                autocomplete="off"
                class="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition-all duration-200"
                @keyup.enter="handleSubmit"
              />
            </div>

            <button
              type="submit"
              :disabled="!username.trim()"
              class="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-zinc-300/60 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:ring-offset-2 focus:ring-offset-white"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-center text-xs text-zinc-400 mt-5">By joining, you agree to our terms of service.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  login: [username: string];
}>();

const username = ref('');

const handleSubmit = () => {
  if (username.value.trim()) {
    emit('login', username.value.trim());
  }
};
</script>