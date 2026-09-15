<script setup lang="ts">
const userName = 'สมศรี จันทร์อังคาร'
const avatarUrl =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80'
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__left">
        <a class="header__brand" href="/" aria-label="HomeServices">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path
              fill="#fff"
              d="M8.5 15.2 16 8.8l7.5 6.4V23a1.2 1.2 0 0 1-1.2 1.2h-4.2v-5.2h-4.2v5.2H9.7A1.2 1.2 0 0 1 8.5 23V15.2Z"
            />
          </svg>
          <span class="text-headline-5">
            <span class="header__home">Home</span>Services
          </span>
        </a>
        <nav class="header__nav">
          <a class="header__link text-body-3" href="/service">บริการของเรา</a>
        </nav>
      </div>

      <div class="header__actions">
        <span class="header__user text-body-3">{{ userName }}</span>
        <img class="header__avatar" :src="avatarUrl" :alt="userName" />
        <button class="btn-icon" type="button" aria-label="การแจ้งเตือน"></button>
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
  max-width: 1440px;
  min-height: 5rem;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-right: auto;
}

.header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--btn-primary);
}

.header__brand .text-headline-5 {
  color: var(--gray-900);
}

.header__home {
  color: var(--btn-primary);
}

.header__nav {
  display: flex;
}

.header__link {
  color: var(--btn-primary);
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

  .header__brand svg {
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
