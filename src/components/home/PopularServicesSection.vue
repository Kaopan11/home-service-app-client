<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ServiceCard from '@/components/home/ServiceCard.vue'
import { type Service } from '@/data/services'
import { getServices, type ServiceListResponse } from '@/services/services'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1556912173-46e0d4d0a0a2?auto=format&fit=crop&w=800&q=80'

const featuredServices = ref<Service[]>([])

onMounted(async () => {
  try {
    const response = await getServices()
    featuredServices.value = (response.data ?? []).slice(0, 3).map((item: ServiceListResponse['data'][number]) => ({
      id: String(item.id),
      title: item.name,
      category: item.categoryName,
      priceMin: Number(item.priceMin ?? 0),
      image: item.image || PLACEHOLDER_IMAGE,
    }))
  } catch {
    featuredServices.value = []
  }
})
</script>

<template>
  <section v-if="featuredServices.length" class="popular-services">
    <h2 class="text-headline-1">บริการยอดฮิตของเรา</h2>
    <div class="popular-services__grid">
      <ServiceCard v-for="service in featuredServices" :key="service.id" :service="service" />
    </div>
    <RouterLink to="/service" class="btn btn--primary">ดูบริการทั้งหมด</RouterLink>
  </section>
</template>

<style scoped>
.popular-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 3.5rem 2rem;
}

.popular-services__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .popular-services {
    padding: 2rem 1rem;
  }
}
</style>

