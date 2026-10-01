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
      path: '/service/:id',
      name: 'service-detail',
      component: () => import('@/pages/ServiceDetailPage.vue'),
    },
    {
      path: '/service/:id/info',
      name: 'service-booking-info',
      component: () => import('@/pages/ServiceBookingInfoPage.vue'),
      meta: { requiresAuth: true },
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
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/pages/FacebookCallbackPage.vue'),
      meta: { public: true },
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/pages/UserProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile/password',
      name: 'profile-password',
      component: () => import('@/pages/ProfilePasswordPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'user-orders',
      component: () => import('@/pages/UserOrdersPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'user-history',
      component: () => import('@/pages/UserOrdersPage.vue'),
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
      component: () => import('@/pages/admin/AdminServiceFormPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/services/:id/edit',
      name: 'admin-service-edit',
      component: () => import('@/pages/admin/AdminServiceFormPage.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/services/:id',
      name: 'admin-service-detail',
      component: () => import('@/pages/admin/AdminServiceDetailPage.vue'),
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
    {
      path: '/technician',
      redirect: { name: 'technician-requests' },
    },
    {
      path: '/technician/requests',
      name: 'technician-requests',
      component: () => import('@/pages/technician/TechnicianRequestsPage.vue'),
      meta: { requiresTechnician: true, title: 'คำขอบริการซ่อม', active: 'requests' },
    },
    {
      path: '/technician/jobs',
      name: 'technician-jobs',
      alias: '/technician/pending',
      component: () => import('@/pages/technician/TechnicianPendingPage.vue'),
      meta: { requiresTechnician: true, title: 'รายการที่รอดำเนินการ', active: 'jobs' },
    },
    {
      path: '/technician/jobs/:id',
      name: 'technician-pending-detail',
      alias: '/technician/pending/:id',
      component: () => import('@/pages/technician/TechnicianPendingDetailPage.vue'),
      meta: { requiresTechnician: true, title: 'รายละเอียดคำสั่งซ่อม', active: 'jobs' },
    },
    {
      path: '/technician/history',
      name: 'technician-history',
      component: () => import('@/pages/technician/TechnicianHistoryPage.vue'),
      meta: { requiresTechnician: true, title: 'ประวัติการซ่อม', active: 'history' },
    },
    {
      path: '/technician/history/:id',
      name: 'technician-history-detail',
      component: () => import('@/pages/technician/TechnicianHistoryDetailPage.vue'),
      meta: { requiresTechnician: true, title: 'รายละเอียดประวัติการซ่อม', active: 'history' },
    },
    {
      path: '/technician/account',
      name: 'technician-account',
      component: () => import('@/pages/technician/TechnicianAccountPage.vue'),
      meta: { requiresTechnician: true, title: 'ตั้งค่าบัญชีผู้ใช้', active: 'account' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.restored) {
    await auth.restoreSession()
  }

  if (to.path === '/login' || to.path === '/register') {
    if (auth.isAuthenticated && auth.isTechnician) {
      return { name: 'technician-requests' }
    }
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

  if (to.meta.requiresTechnician && (!getStoredAccessToken() || !auth.isTechnician)) {
    return { name: 'login' }
  }

  return true
})

export default router
