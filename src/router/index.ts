import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/design/colors',
    },
    {
      path: '/design/colors',
      name: 'color-palette',
      component: () => import('@/pages/ColorPaletteDemo.vue'),
    },
  ],
})

export default router
