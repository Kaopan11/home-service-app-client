<script setup lang="ts">
import ServiceCard from '@/components/home/ServiceCard.vue'
import { services } from '@/data/services'

const featuredIds = ['general-clean', 'ac-clean', 'washer-clean']
const featuredServices = featuredIds
  .map((id) => services.find((service) => service.id === id))
  .filter((service) => service != null)
</script>

<template>
  <section class="popular-services">
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
    padding: 2rem 1.25rem;
    gap: 1.5rem;
  }
}
</style>
