<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'admin-login' })
}
</script>

<template>
  <main class="categories-page">
    <header class="categories-page__header">
      <h1 class="text-headline-1">หมวดหมู่</h1>
      <button type="button" class="categories-page__logout" @click="handleLogout">ออกจากระบบ</button>
    </header>
    <p class="text-body-2">หน้านี้เป็น placeholder สำหรับงาน Admin Categories รอบถัดไป</p>
  </main>
</template>

<style scoped>
.categories-page {
  min-height: 100svh;
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px;
  background: var(--bg);
}

.categories-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.categories-page__logout {
  height: 44px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--blue-600);
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}
</style>
