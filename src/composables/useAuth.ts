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
    isTechnician,
  } = storeToRefs(store)

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isAuthenticated,
    isAdmin,
    isTechnician,
    login: store.login,
    loginCustomer: store.loginCustomer,
    register: store.register,
    logout: store.logout,
    restoreSession: store.restoreSession,
    updateUser: store.updateUser,
    clearAuth: store.clearAuth,
  }
}
