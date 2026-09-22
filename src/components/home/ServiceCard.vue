<script setup lang="ts">
import { formatServicePrice, type Service } from '@/data/services'

defineProps<{
  service: Service
}>()
</script>

<template>
  <article class="card">
    <img :src="service.image" :alt="service.title" />
    <section>
      <span class="badge">{{ service.category }}</span>
      <h2>{{ service.title }}</h2>
      <p>
        <span class="icon icon--tag"></span>
        {{ formatServicePrice(service.priceMin, service.priceMax) }}
      </p>
      <RouterLink class="btn btn--ghost" :to="{ name: 'service-detail', params: { id: service.id } }">
        เลือกบริการ
      </RouterLink>
    </section>
  </article>
</template>
