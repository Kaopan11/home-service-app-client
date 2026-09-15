<script setup lang="ts">
withDefaults(
  defineProps<{
    isLoggedIn?: boolean
  }>(),
  {
    isLoggedIn: false,
  },
)

const userName = 'สมศรี จันทร์อังคาร'
const avatarUrl =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80'
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__left">
        <a class="header__brand" href="/" aria-label="HomeServices">
          <img class="header__brand-icon" src="/icons/brand/house.svg" alt="" width="32" height="32" />
          <span class="text-headline-5 header__brand-text">HomeServices</span>
        </a>
        <nav class="header__nav">
          <a class="header__link text-body-3" href="/service">บริการของเรา</a>
        </nav>
      </div>

      <div class="header__actions">
        <template v-if="isLoggedIn">
          <span class="header__user text-body-3">{{ userName }}</span>
          <img class="header__avatar" :src="avatarUrl" :alt="userName" />
          <button class="btn-icon" type="button" aria-label="การแจ้งเตือน"></button>
        </template>
        <RouterLink v-else to="/login" class="btn btn--secondary">เข้าสู่ระบบ</RouterLink>
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
