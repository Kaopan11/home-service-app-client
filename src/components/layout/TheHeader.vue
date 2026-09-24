<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { icons } from '@/constants/icons'
import { USER_PROFILE_STORAGE_KEY } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  guest?: boolean
  isLoggedIn?: boolean
}>()

const STOCK_AVATAR = 'photo-1544005313-94ddf0286df2'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, isAdmin } = storeToRefs(auth)

const menuOpen = ref(false)
const accountEl = ref<HTMLElement | null>(null)
const localProfile = ref<{ displayName?: string; firstName?: string; lastName?: string; avatarUrl?: string } | null>(null)

function loadProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    localProfile.value = raw ? JSON.parse(raw) : null
  } catch {
    localProfile.value = null
  }
}

function closeMenuIfOutside(event: MouseEvent) {
  if (!accountEl.value?.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

async function logout(): Promise<void> {
  menuOpen.value = false
  localProfile.value = null
  void auth.logout()
  await router.push({ name: 'home' })
}

onMounted(() => {
  loadProfile()
  window.addEventListener('storage', loadProfile)
  document.addEventListener('click', closeMenuIfOutside)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadProfile)
  document.removeEventListener('click', closeMenuIfOutside)
})

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

const guestChrome = computed(() => !isAuthenticated.value)

const showLogin = computed(() => !isAuthenticated.value)

const userName = computed(() => {
  if (localProfile.value?.displayName) return localProfile.value.displayName
  if (localProfile.value?.firstName && localProfile.value?.lastName) {
    return `${localProfile.value.firstName} ${localProfile.value.lastName}`
  }
  return user.value?.displayName || user.value?.fullName || user.value?.email || 'บัญชีของฉัน'
})

const avatarUrl = computed(() => {
  const url = localProfile.value?.avatarUrl || user.value?.avatarUrl || ''
  if (!url || url.includes(STOCK_AVATAR)) return ''
  return url
})

const userInitial = computed(() => userName.value.trim().charAt(0).toUpperCase() || '?')
</script>

<template>
  <header class="header" :class="{ 'header--guest': guestChrome }">
    <div class="header__inner">
      <div class="header__left">
        <RouterLink class="header__brand" :to="{ name: 'home' }" aria-label="HomeServices">
          <img
            class="header__brand-icon"
            :class="{ header__logo: guestChrome }"
            :src="icons.brand.house"
            alt=""
            width="32"
            height="32"
          />
          <span v-if="guestChrome" class="header__name">
            <span class="header__home">Home</span>Services
          </span>
          <span v-else class="text-headline-5 header__brand-text">HomeServices</span>
        </RouterLink>
        <nav class="header__nav">
          <RouterLink class="header__link text-body-3" :to="{ name: 'service' }">
            บริการของเรา
          </RouterLink>
        </nav>
      </div>

      <div class="header__actions">
        <RouterLink v-if="showLogin" class="btn btn--secondary" :to="{ name: 'login' }">
          เข้าสู่ระบบ
        </RouterLink>
        <template v-else>
          <div ref="accountEl" class="header__account">
            <button
              class="header__user-profile"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="menuOpen"
              aria-label="เมนูบัญชี"
              @click.stop="menuOpen = !menuOpen"
            >
              <span class="header__user text-body-3">{{ userName }}</span>
              <img v-if="avatarUrl" class="header__avatar" :src="avatarUrl" :alt="userName" />
              <span v-else class="header__avatar header__avatar--initial" aria-hidden="true">{{ userInitial }}</span>
            </button>
            <nav v-show="menuOpen" class="header__dropdown" aria-label="เมนูบัญชี">
              <ul>
                <li>
                  <RouterLink
                    class="header__dropdown-item"
                    :to="{ name: 'user-profile' }"
                    @click="menuOpen = false"
                  >
                    <img :src="icons.navigation.account" width="16" height="16" alt="" />
                    ข้อมูลผู้ใช้งาน
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    class="header__dropdown-item"
                    :to="{ name: 'user-orders' }"
                    @click="menuOpen = false"
                  >
                    <img :src="icons.navigation.list" width="16" height="16" alt="" />
                    รายการคำสั่งซ่อม
                  </RouterLink>
                </li>
                <li>
                  <RouterLink
                    class="header__dropdown-item"
                    :to="{ name: 'user-history' }"
                    @click="menuOpen = false"
                  >
                    <img :src="icons.navigation.history" width="16" height="16" alt="" />
                    ประวัติการซ่อม
                  </RouterLink>
                </li>
                <li v-if="isAdmin">
                  <RouterLink
                    class="header__dropdown-item"
                    :to="{ name: 'admin-categories' }"
                    @click="menuOpen = false"
                  >
                    <img :src="icons.navigation.history" width="16" height="16" alt="" />
                    Admin Dashboard
                  </RouterLink>
                </li>
                <li>
                  <hr class="header__dropdown-line" />
                </li>
                <li>
                  <button class="header__dropdown-item" type="button" @click.stop="logout">
                    <img :src="icons.navigation.logout" width="16" height="16" alt="" />
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          <button class="btn-icon" type="button" aria-label="การแจ้งเตือน"></button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}

.header--guest {
  box-shadow: var(--shadow);
}

.header__logo {
  display: block;
  width: 32px;
  height: 32px;
}

.header__name {
  font-weight: var(--font-weight-medium);
  font-size: 1.5rem;
  line-height: 2.25rem;
  color: var(--blue-600);
}

.header__home {
  color: var(--btn-primary);
}

.header--guest .header__left {
  gap: 3.75rem;
}

.header--guest .header__link {
  padding: 10px;
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--black);
}

.header--guest .header__actions .btn {
  height: 40px;
  padding: 8px 24px;
  font-weight: var(--font-weight-medium);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1320px;
  min-height: 5rem;
  margin: 0 auto;
  padding: 0.75rem 3rem;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  text-decoration: none;
  color: var(--btn-primary);
}

.header__brand-text {
  color: var(--btn-primary);
}

.header__nav {
  display: flex;
}

.header__link {
  color: var(--gray-900);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.header__account {
  position: relative;
}

.header__user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.header__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  width: 180px;
  padding: 8px 0;
  background: var(--white);
  box-shadow: var(--shadow);
  border-radius: 8px;
}

.header__dropdown ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.header__dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 180px;
  height: 33px;
  padding: 6px 14px;
  border: 0;
  background: var(--white);
  color: var(--gray-800);
  font-family: inherit;
  font-size: var(--body-3-size);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.header__dropdown-item img {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.header__dropdown-item:hover {
  background: var(--gray-100);
  color: var(--gray-950);
}

.header__dropdown-line {
  width: 180px;
  margin: 0;
  border: 0;
  border-top: 1px solid var(--gray-300);
}

.header__user {
  color: var(--gray-800);
}

.header__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
}

.header__avatar--initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--blue-100);
  color: var(--blue-600);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
}

@media (max-width: 768px) {
  .header--guest {
    box-shadow: 2px 2px 12px rgba(64, 50, 133, 0.12);
  }

  .header--guest .header__inner {
    min-height: 53px;
    padding: 0 16px;
  }

  .header--guest .header__left {
    display: contents;
  }

  .header--guest .header__brand {
    margin-right: auto;
    gap: 4px;
  }

  .header--guest .header__logo {
    width: 26px;
    height: 25px;
  }

  .header--guest .header__name {
    font-size: 14px;
    line-height: 21px;
  }

  .header--guest .header__link {
    padding: 16px 10px;
    font-size: var(--body-3-size);
    font-weight: var(--font-weight-regular);
  }

  .header--guest .header__actions .btn {
    height: 37px;
    padding: 8px 16px;
    font-size: 14px;
    line-height: 21px;
  }

  .header__inner {
    min-height: 3.5rem;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }

  .header__left {
    gap: 0.75rem;
    min-width: 0;
  }

  .header__brand {
    gap: 0.375rem;
  }

  .header__brand-icon {
    width: 24px;
    height: 24px;
  }

  .header__brand .text-headline-5,
  .header__link {
    white-space: nowrap;
  }

  .header__user {
    display: none;
  }

  .header__avatar {
    width: 2rem;
    height: 2rem;
  }

  .header__actions {
    gap: 0.5rem;
  }

  .header__actions .btn-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>
