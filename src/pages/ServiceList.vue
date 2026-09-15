<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue'
import PromoBanner from '@/components/home/PromoBanner.vue'
import ServiceFilterBar from '@/components/home/ServiceFilterBar.vue'
import ServiceGrid from '@/components/home/ServiceGrid.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { filterServices, services } from '@/data/services'
import { computed, reactive, ref } from 'vue'

const filters = reactive({
  query: '',
  category: 'all',
  priceMin: 0,
  priceMax: 2000,
  sort: 'name-asc',
})

const appliedQuery = ref('')

const visibleServices = computed(() =>
  filterServices(services, {
    query: appliedQuery.value,
    category: filters.category,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    sort: filters.sort,
  }),
)

function applySearch() {
  appliedQuery.value = filters.query
}
</script>

<template>
  <div class="home">
    <TheHeader />
    <HeroSection />
    <ServiceFilterBar
      v-model:query="filters.query"
      v-model:category="filters.category"
      v-model:price-min="filters.priceMin"
      v-model:price-max="filters.priceMax"
      v-model:sort="filters.sort"
      @search="applySearch"
    />
    <div class="home__content">
      <ServiceGrid :services="visibleServices" />
    </div>
    <PromoBanner />
    <TheFooter />
  </div>
</template>

<style scoped>
.home {
  background: var(--bg);
}

.home__content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 1440px;
  margin: 0 auto 4rem;
  padding: 2.5rem 2rem 0;
}

@media (max-width: 768px) {
  .home__content {
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem 1rem 0;
  }
}
</style>
