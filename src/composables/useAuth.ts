import { ref } from 'vue'

export function useAuth() {
  const isAuthenticated = ref(false)

  return {
    isAuthenticated,
  }
}
