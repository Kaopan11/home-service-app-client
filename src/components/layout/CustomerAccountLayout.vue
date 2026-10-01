<script setup lang="ts">
import TheFooter from '@/components/layout/TheFooter.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { icons } from '@/constants/icons'
</script>

<template>
  <div class="account-page">
    <TheHeader />

    <div class="account-shell">
      <section v-if="$slots.banner" class="account-banner">
        <slot name="banner" />
      </section>

      <aside class="account-sidebar" aria-label="เมนูบัญชีผู้ใช้">
        <div class="sidebar-card">
          <h2 class="sidebar-card__title">บัญชีผู้ใช้</h2>
          <hr class="sidebar-card__divider" />
          <nav class="sidebar-nav">
            <RouterLink
              class="sidebar-nav__item"
              exact-active-class="sidebar-nav__item--active"
              :to="{ name: 'user-profile' }"
            >
              <span class="sidebar-nav__icon">
                <img :src="icons.customerServices.account" alt="" width="24" height="24" />
              </span>
              <span class="sidebar-nav__text">ข้อมูล<br class="sidebar-nav__break" />ผู้ใช้งาน</span>
            </RouterLink>

            <RouterLink
              class="sidebar-nav__item sidebar-nav__item--password"
              exact-active-class="sidebar-nav__item--active"
              :to="{ name: 'profile-password' }"
            >
              <span class="sidebar-nav__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <span class="sidebar-nav__text">รีเซ็ตรหัสผ่าน</span>
            </RouterLink>

            <RouterLink
              class="sidebar-nav__item"
              exact-active-class="sidebar-nav__item--active"
              :to="{ name: 'user-orders' }"
            >
              <span class="sidebar-nav__icon">
                <img :src="icons.customerServices.list" alt="" width="24" height="24" />
              </span>
              <span class="sidebar-nav__text">รายการ<br class="sidebar-nav__break" />คำสั่งซ่อม</span>
            </RouterLink>

            <RouterLink
              class="sidebar-nav__item"
              exact-active-class="sidebar-nav__item--active"
              :to="{ name: 'user-history' }"
            >
              <span class="sidebar-nav__icon">
                <img :src="icons.customerServices.history" alt="" width="24" height="24" />
              </span>
              <span class="sidebar-nav__text">ประวัติ<br class="sidebar-nav__break" />การซ่อม</span>
            </RouterLink>
          </nav>
        </div>
      </aside>

      <section class="account-content">
        <slot />
      </section>
    </div>

    <TheFooter />
  </div>
</template>

<style scoped>
.account-page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow-x: clip;
}

.account-shell {
  flex: 1;
  display: grid;
  grid-template-columns: 253px minmax(0, 1fr);
  grid-template-areas:
    'banner banner'
    'sidebar content';
  column-gap: 36px;
  row-gap: 28px;
  align-items: start;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 160px 4rem;
}

.account-banner {
  grid-area: banner;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background: var(--blue-600);
  color: var(--white);
}

.account-banner :deep(h1) {
  margin: 0;
  color: var(--white);
  font-family: var(--font-family);
  font-size: var(--headline-1-size);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height);
  text-align: center;
}

.account-sidebar {
  grid-area: sidebar;
  position: sticky;
  top: 5rem;
  z-index: 10;
  width: 100%;
}

.sidebar-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 24px;
}

.sidebar-card__title {
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
  font-size: var(--headline-3-size);
  font-weight: var(--font-weight-regular);
  color: var(--gray-700);
}

.sidebar-card__divider {
  display: block;
  width: 100%;
  margin: 20px 0 16px;
  border: 0;
  border-top: 1px solid var(--gray-300);
}

.sidebar-nav__break {
  display: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-radius: 0;
  text-decoration: none;
  font-family: var(--font-family);
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-regular);
  color: var(--gray-950);
}

.sidebar-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--gray-500);
}

.sidebar-nav__icon img,
.sidebar-nav__icon svg {
  display: block;
  width: 24px;
  height: 24px;
}

.sidebar-nav__item:hover:not(.sidebar-nav__item--active) {
  color: var(--gray-800);
}

.sidebar-nav__item--active {
  background: transparent;
  color: var(--blue-700);
  font-weight: var(--font-weight-regular);
}

.sidebar-nav__item--active .sidebar-nav__icon {
  color: var(--blue-700);
}

.account-content {
  grid-area: content;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1200px) {
  .account-shell {
    padding: 0 2rem 4rem;
  }
}

@media (max-width: 960px) {
  .account-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      'banner'
      'sidebar'
      'content';
    column-gap: 0;
  }

  .account-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .account-shell {
    grid-template-areas:
      'sidebar'
      'banner'
      'content';
    row-gap: 16px;
    padding: 0 0 2.5rem;
  }

  .account-banner {
    width: auto;
    min-height: 46px;
    margin-left: 16px;
    margin-right: 16px;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .account-banner :deep(h1) {
    font-size: var(--headline-2-size);
  }

  .account-sidebar {
    padding: 8px 16px;
    background: var(--bg);
    box-shadow: var(--shadow);
  }

  .sidebar-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 16px;
  }

  .sidebar-card__title {
    font-size: var(--headline-4-size);
    font-weight: var(--font-weight-medium);
  }

  .sidebar-card__divider {
    margin: 0;
  }

  .sidebar-nav {
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
  }

  .sidebar-nav__item {
    flex: 1;
    gap: 4px;
    padding: 4px 0;
    font-size: var(--body-3-size);
  }

  .sidebar-nav__item--password {
    display: none;
  }

  .sidebar-nav__break {
    display: block;
  }

  .sidebar-nav__text {
    flex: 1;
    min-width: 0;
    line-height: var(--line-height);
  }

  .account-content {
    padding: 0 16px;
  }
}
</style>
