<script setup lang="ts">
import ServiceCard from '@/components/home/ServiceCard.vue'
import type { Service } from '@/data/services'

defineProps<{
  services: Service[]
}>()
</script>

<template>
  <section class="grid" aria-label="รายการบริการ">
    <ServiceCard v-for="service in services" :key="service.id" :service="service" />
    <p v-if="services.length === 0" class="grid__empty text-body-2">ไม่พบบริการที่ค้นหา</p>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 349px));
  justify-content: center;
  gap: 2.5rem;
}

.grid :deep(.card) {
  width: 100%;
}

.grid__empty {
  grid-column: 1 / -1;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--gray-600);
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 349px));
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    justify-items: stretch;
  }

  .grid :deep(.card) {
    max-width: none;
    width: 100%;
  }
}
</style>
