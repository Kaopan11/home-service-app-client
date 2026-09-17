import { computed, onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import type { UserAddress } from '@/types/user'

/**
 * Composable helper for Service Details and checkout flows
 * to automatically retrieve and bind user's saved Address from the database/profile store.
 */
export function useUserAddress() {
  const profileStore = useProfileStore()

  onMounted(() => {
    // Ensure profile is loaded from database/cache
    profileStore.loadProfile()
  })

  const address = computed<UserAddress>(() => profileStore.address)
  const fullAddressSummary = computed<string>(() => profileStore.fullAddressSummary)
  const isLoading = computed<boolean>(() => profileStore.isLoading)

  return {
    profileStore,
    address,
    fullAddressSummary,
    isLoading,
    refreshAddress: () => profileStore.loadProfile(),
  }
}
