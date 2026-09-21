<script setup lang="ts">
import { useRouter } from 'vue-router'
import { icons } from '@/constants/icons'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  active: 'categories' | 'services' | 'promos'
}>()

const auth = useAuthStore()
const router = useRouter()

async function handleLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink class="admin-sidebar__brand" to="/admin/categories">
        <img class="admin-sidebar__logo" :src="icons.admin.house" width="32" height="32" alt="" />
        <span>HomeServices</span>
      </RouterLink>

      <nav class="admin-sidebar__nav" aria-label="เมนูแอดมิน">
        <RouterLink
          class="admin-sidebar__link"
          :class="{ 'admin-sidebar__link--active': active === 'categories' }"
          :to="{ name: 'admin-categories' }"
        >
          <img :src="icons.admin.category" width="24" height="24" alt="" />
          หมวดหมู่
        </RouterLink>
        <RouterLink
          class="admin-sidebar__link"
          :class="{ 'admin-sidebar__link--active': active === 'services' }"
          :to="{ name: 'admin-services' }"
        >
          <img :src="icons.admin.copy" width="24" height="24" alt="" />
          บริการ
        </RouterLink>
        <RouterLink
          class="admin-sidebar__link"
          :class="{ 'admin-sidebar__link--active': active === 'promos' }"
          :to="{ name: 'admin-promos' }"
        >
          <img :src="icons.admin.promo" width="24" height="24" alt="" />
          Promotion Code
        </RouterLink>
      </nav>

      <button type="button" class="admin-sidebar__logout" @click="handleLogout">
        <img :src="icons.admin.logout" width="24" height="24" alt="" />
        ออกจากระบบ
      </button>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <slot name="topbar" />
      </header>
      <section class="admin-content">
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100svh;
  background: var(--bg);
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  padding: 24px 16px;
  background: var(--blue-950);
  color: var(--white);
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 16px;
  margin-bottom: 24px;
  border-radius: 8px;
  background: var(--white);
  color: var(--blue-500);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
}

.admin-sidebar__logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.admin-sidebar__link,
.admin-sidebar__logout {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  text-align: left;
}

.admin-sidebar__link img,
.admin-sidebar__logout img {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.admin-sidebar__link--active {
  background: var(--blue-900);
}

.admin-sidebar__logout {
  margin-top: auto;
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 80px;
  padding: 0 40px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-300);
}

.admin-content {
  flex: 1;
  padding: 40px;
}
</style>
