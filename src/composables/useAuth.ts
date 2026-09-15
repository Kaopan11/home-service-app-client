import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const {
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isAuthenticated,
    isAdmin,
  } = storeToRefs(store)

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isAuthenticated,
    isAdmin,
    login: store.login,
    logout: store.logout,
    restoreSession: store.restoreSession,
    clearAuth: store.clearAuth,
  }
}
