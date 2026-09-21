<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'

const route = useRoute()

const active = computed(() => {
  const value = route.meta.active
  if (value === 'requests' || value === 'jobs' || value === 'history' || value === 'account') {
    return value
  }
  return 'requests' as const
})

const title = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'แดชบอร์ดช่าง'))
</script>

<template>
  <TechnicianLayout :active="active">
    <template #topbar>
      <h1 class="page-title">{{ title }}</h1>
    </template>
    <p class="hint">หน้ารอทำในรอบถัดไป</p>
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  color: var(--gray-800);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.hint {
  margin: 0;
  color: var(--gray-700);
}
</style>
