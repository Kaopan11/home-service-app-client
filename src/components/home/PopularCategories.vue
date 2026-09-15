<script setup lang="ts">
import { SERVICE_CATEGORIES } from '@/data/services'

const categoryImages: Record<string, string> = {
  บริการด้านห้องแอร์:
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  บริการด้านทั่วไป:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  บริการด้านห้องครัว:
    'https://images.unsplash.com/photo-1556912173-46e0d4d0a0a2?auto=format&fit=crop&w=600&q=80',
  บริการด้านห้องน้ำ:
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
}
</script>

<template>
  <section class="popular-categories">
    <h2 class="text-headline-1">หมวดหมู่บริการยอดนิยม</h2>
    <div class="popular-categories__grid">
      <RouterLink
        v-for="category in SERVICE_CATEGORIES"
        :key="category"
        to="/service"
        class="popular-categories__item"
      >
        <img :src="categoryImages[category]" :alt="category" />
        <span class="text-headline-5">{{ category }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.popular-categories {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.popular-categories__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.popular-categories__item {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  height: 12rem;
  border-radius: var(--radius);
  text-decoration: none;
}

.popular-categories__item img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-categories__item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(18 24 38 / 0) 40%, rgb(18 24 38 / 0.75) 100%);
}

.popular-categories__item span {
  position: relative;
  z-index: 1;
  padding: 1rem;
  color: var(--white);
  text-align: left;
}

@media (max-width: 768px) {
  .popular-categories {
    padding: 0 1rem;
  }

  .popular-categories__grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .popular-categories__item {
    height: 8rem;
  }
}
</style>
