<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { icons } from '@/constants/icons'
import { useAuthStore } from '@/stores/auth'
import { useTechnicianJobsStore } from '@/stores/technicianJobs'

defineProps<{
  active: 'requests' | 'jobs' | 'history' | 'account'
}>()

const auth = useAuthStore()
const router = useRouter()
const jobsStore = useTechnicianJobsStore()
const { pendingCount } = storeToRefs(jobsStore)

onMounted(() => {
  void jobsStore.refreshPendingCount()
})

async function handleLogout(): Promise<void> {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="tech-shell">
    <aside class="tech-sidebar">
      <RouterLink class="tech-sidebar__brand" :to="{ name: 'technician-requests' }">
        <img class="tech-sidebar__logo" :src="icons.admin.house" width="32" height="32" alt="" />
        <span>HomeServices</span>
      </RouterLink>

      <nav class="tech-sidebar__nav" aria-label="เมนูช่าง">
        <RouterLink
          class="tech-sidebar__link"
          :class="{ 'tech-sidebar__link--active': active === 'requests' }"
          :to="{ name: 'technician-requests' }"
        >
          <img :src="icons.notification.outline" width="24" height="24" alt="" />
          <span>คำขอบริการซ่อม</span>
          <span
            v-if="pendingCount > 0"
            class="tech-sidebar__badge"
            :aria-label="`งานที่รอรับ ${pendingCount} งาน`"
          >
            {{ pendingCount }}
          </span>
        </RouterLink>
        <RouterLink
          class="tech-sidebar__link"
          :class="{ 'tech-sidebar__link--active': active === 'jobs' }"
          :to="{ name: 'technician-jobs' }"
        >
          <img :src="icons.navigation.list" width="24" height="24" alt="" />
          <span>รายการที่รอดำเนินการ</span>
        </RouterLink>
        <RouterLink
          class="tech-sidebar__link"
          :class="{ 'tech-sidebar__link--active': active === 'history' }"
          :to="{ name: 'technician-history' }"
        >
          <img :src="icons.navigation.history" width="24" height="24" alt="" />
          <span>ประวัติการซ่อม</span>
        </RouterLink>
        <RouterLink
          class="tech-sidebar__link"
          :class="{ 'tech-sidebar__link--active': active === 'account' }"
          :to="{ name: 'technician-account' }"
        >
          <img :src="icons.navigation.account" width="24" height="24" alt="" />
          <span>ตั้งค่าบัญชีผู้ใช้</span>
        </RouterLink>
      </nav>

      <button type="button" class="tech-sidebar__logout" @click="handleLogout">
        <img :src="icons.navigation.logout" width="24" height="24" alt="" />
        ออกจากระบบ
      </button>
    </aside>

    <div class="tech-main">
      <header class="tech-topbar">
        <slot name="topbar" />
      </header>
      <section class="tech-content">
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped>
.tech-shell {
  display: flex;
  height: 100svh;
  max-height: 100svh;
  overflow: hidden;
  background: var(--bg);
}

.tech-sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  height: 100%;
  padding: 24px 16px;
  overflow: hidden;
  background: var(--blue-950);
  color: var(--white);
}

.tech-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  margin-bottom: 24px;
  border-radius: 8px;
  background: var(--white);
  color: var(--blue-500);
  font-size: 18px;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  flex-shrink: 0;
  white-space: nowrap;
}

.tech-sidebar__logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.tech-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.tech-sidebar__link,
.tech-sidebar__logout {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}

.tech-sidebar__link span:not(.tech-sidebar__badge) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tech-sidebar__link img,
.tech-sidebar__logout img {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.tech-sidebar__link--active {
  background: var(--blue-900);
}

.tech-sidebar__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: auto;
  border-radius: 999px;
  background: var(--red);
  color: var(--white);
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  flex-shrink: 0;
}

.tech-sidebar__logout {
  margin-top: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

.tech-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tech-topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 80px;
  padding: 0 40px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-300);
  flex-shrink: 0;
}

.tech-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 40px;
}

@media (max-width: 1280px) {
  .tech-topbar,
  .tech-content {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 900px) {
  .tech-sidebar {
    width: 220px;
    padding: 16px 12px;
  }

  .tech-sidebar__brand {
    font-size: 16px;
    padding: 0 8px;
  }

  .tech-topbar {
    height: 64px;
    padding: 0 16px;
  }

  .tech-content {
    padding: 16px;
  }
}
</style>
