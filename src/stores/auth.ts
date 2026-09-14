import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string } | null>(null)

  return {
    user,
  }
})
