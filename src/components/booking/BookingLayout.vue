<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BookingStepper from '@/components/booking/BookingStepper.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  image: string
  title: string
  currentStep: number
}>()

const { isAuthenticated } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="booking">
    <TheHeader :guest="!isAuthenticated" />

    <section class="hero" :style="{ backgroundImage: `url(${image})` }">
      <div class="hero__inner">
        <nav class="hero__crumb" aria-label="breadcrumb">
          <RouterLink class="hero__crumb-link" :to="{ name: 'service' }">บริการของเรา</RouterLink>
          <span class="hero__crumb-sep" aria-hidden="true">›</span>
          <span class="hero__crumb-current">{{ title }}</span>
        </nav>
      </div>
    </section>

    <section class="booking__stepper">
      <BookingStepper :current-step="currentStep" />
    </section>

    <div class="booking__body">
      <div class="booking__grid">
        <slot />
        <slot name="summary" />
      </div>
    </div>

    <div class="booking__nav">
      <div class="booking__nav-inner">
        <slot name="nav" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking {
  min-height: 100svh;
  background: var(--bg);
  padding-bottom: 6rem;
}

.hero {
  position: relative;
  height: 15.5rem;
  background-size: cover;
  background-position: center;
}

.hero__inner {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero__crumb {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--white);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  color: var(--blue-800);
}

.hero__crumb-link {
  color: var(--blue-800);
  text-decoration: none;
  font-size: var(--body-3-size);
}

.hero__crumb-link:hover {
  text-decoration: underline;
}

.hero__crumb-sep {
  color: var(--blue-700);
}

.hero__crumb-current {
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--blue-800);
}

.booking__stepper {
  background: var(--white);
}

.booking__body {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
}

.booking__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(17.5rem, 22rem);
  align-items: start;
  gap: 1.5rem;
}

.booking__nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  background: var(--white);
  box-shadow: 0 -2px 16px rgba(23, 51, 106, 0.1);
}

.booking__nav-inner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

@media (max-width: 900px) {
  .hero {
    height: 11rem;
  }

  .hero__inner {
    padding: 0 1rem;
  }

  .hero__crumb {
    padding: 0.625rem 1rem;
  }

  .booking__body {
    padding: 1rem 1rem 1.5rem;
  }

  .booking__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
