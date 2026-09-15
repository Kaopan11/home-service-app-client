import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getStoredAccessToken } from '@/utils/authStorage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/service',
      name: 'service',
      component: () => import('@/pages/ServiceList.vue'),
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/pages/admin/AdminLoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: () => import('@/pages/admin/AdminCategoriesPage.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.restored) {
    await auth.restoreSession()
  }

  if (to.path === '/admin/login') {
    if (getStoredAccessToken() && auth.isAdmin) {
      return { name: 'admin-categories' }
    }
    return true
  }

  if (to.meta.requiresAdmin) {
    if (!getStoredAccessToken() || !auth.isAuthenticated || !auth.isAdmin) {
      auth.clearAuth()
      return { name: 'admin-login' }
    }
  }

  return true
})

export default router
