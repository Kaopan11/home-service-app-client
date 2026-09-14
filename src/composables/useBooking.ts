import { ref } from 'vue'

export function useBooking() {
  const isLoading = ref(false)

  return {
    isLoading,
  }
}
