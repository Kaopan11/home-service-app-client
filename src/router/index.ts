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
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { public: true },
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/pages/UserProfilePage.vue'),
      meta: { requiresAuth: true },
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
      component: () => import('@/pages/admin/categories/CategoryListPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/categories/new',
      name: 'admin-category-new',
      component: () => import('@/pages/admin/categories/CategoryCreatePage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/categories/:id/edit',
      name: 'admin-category-edit',
      component: () => import('@/pages/admin/categories/CategoryEditPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/categories/:id',
      name: 'admin-category-detail',
      component: () => import('@/pages/admin/categories/CategoryDetailPage.vue'),
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
      component: () => import('@/pages/admin/promos/PromoListPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/promos/new',
      name: 'admin-promo-new',
      component: () => import('@/pages/admin/promos/PromoCreatePage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/promos/:id/edit',
      name: 'admin-promo-edit',
      component: () => import('@/pages/admin/promos/PromoEditPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/promos/:id',
      name: 'admin-promo-detail',
      component: () => import('@/pages/admin/promos/PromoDetailPage.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.restored) {
    await auth.restoreSession()
  }

  if (to.path === '/login' || to.path === '/register') {
    if (auth.isAuthenticated && !auth.isAdmin) {
      return { name: 'home' }
    }
    return true
  }

  if (to.path === '/admin/login') {
    if (getStoredAccessToken() && auth.isAdmin) {
      return { name: 'admin-categories' }
    }
    return true
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && (!getStoredAccessToken() || !auth.isAdmin)) {
    return { name: 'admin-login' }
  }

  return true
})

export default router
