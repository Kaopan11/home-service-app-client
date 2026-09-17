<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue'
import PromoBanner from '@/components/home/PromoBanner.vue'
import ServiceFilterBar from '@/components/home/ServiceFilterBar.vue'
import ServiceGrid from '@/components/home/ServiceGrid.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { filterServices, services, type Service } from '@/data/services'
import { useAuthStore } from '@/stores/auth'
import { getServices, type ServiceListResponse } from '@/services/services'
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

type ApiService = ServiceListResponse['data'][number]

function mapApiService(item: ApiService): Service {
  return {
    id: String(item.id),
    title: item.name,
    category: item.categoryName,
    priceMin: 0,
    image: '',
  }
}

const items = ref<Service[]>([])
const error = ref('')

onMounted(async () => {
  try {
    const res = await getServices()
    items.value = res.data.map(mapApiService)
  } catch {
    error.value = 'โหลดบริการไม่สำเร็จ แสดงข้อมูลตัวอย่างแทน'
    items.value = services
  }
})

const filters = reactive({
  query: '',
  category: 'all',
  priceMin: 0,
  priceMax: 2000,
  sort: 'name-asc',
})

const appliedQuery = ref('')

const { isAuthenticated } = storeToRefs(useAuthStore())

const visibleServices = computed(() =>
  filterServices(items.value, {
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
    <TheHeader :guest="!isAuthenticated" />
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
      <p v-if="error" class="home__error text-body-3">{{ error }}</p>
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

.home__error {
  color: var(--gray-600);
  text-align: center;
}

@media (max-width: 768px) {
  .home__content {
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem 1rem 0;
  }
}
</style>
