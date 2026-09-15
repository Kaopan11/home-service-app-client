import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getStoredAccessToken } from '@/utils/authStorage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/service',
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
    {
      path: '/admin/services',
      name: 'admin-services',
      component: () => import('@/pages/admin/AdminServicesPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/services/new',
      name: 'admin-service-new',
      component: () => import('@/pages/admin/AdminPlaceholderPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/services/:id/edit',
      name: 'admin-service-edit',
      component: () => import('@/pages/admin/AdminPlaceholderPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/promos',
      name: 'admin-promos',
      component: () => import('@/pages/admin/AdminPlaceholderPage.vue'),
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
      return { name: 'admin-services' }
    }
    return true
  }

  // ponytail: admin pages are open until login/env is ready; restore requiresAdmin check here
  return true
})

export default router
