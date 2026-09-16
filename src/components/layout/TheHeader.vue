<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { icons } from '@/constants/icons'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  guest?: boolean
  isLoggedIn?: boolean
}>()

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80'

const auth = useAuthStore()
const { user, isAuthenticated } = storeToRefs(auth)

const localProfile = ref<{ displayName?: string; firstName?: string; lastName?: string; avatarUrl?: string } | null>(null)

function loadProfile() {
  try {
    const raw = localStorage.getItem('home_services_user_profile')
    if (raw) {
      localProfile.value = JSON.parse(raw)
    }
  } catch {}
}

onMounted(() => {
  loadProfile()
  window.addEventListener('storage', loadProfile)
})

const guestChrome = computed(() => props.guest === true)

const showLogin = computed(() => {
  if (props.guest != null) return props.guest
  if (props.isLoggedIn != null) return !props.isLoggedIn
  return !isAuthenticated.value && !localProfile.value
})

const userName = computed(() => {
  if (localProfile.value?.displayName) return localProfile.value.displayName
  if (localProfile.value?.firstName && localProfile.value?.lastName) {
    return `${localProfile.value.firstName} ${localProfile.value.lastName}`
  }
  return user.value?.displayName || user.value?.fullName || user.value?.email || 'บัญชีของฉัน'
})

const avatarUrl = computed(() => {
  return localProfile.value?.avatarUrl || user.value?.avatarUrl || FALLBACK_AVATAR
})
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
          <RouterLink to="/profile" class="header__user-profile" aria-label="โปรไฟล์ผู้ใช้งาน">
            <span class="header__user text-body-3">{{ userName }}</span>
            <img class="header__avatar" :src="avatarUrl" :alt="userName" />
          </RouterLink>
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

.header__user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.header__user-profile:hover {
  opacity: 0.85;
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
