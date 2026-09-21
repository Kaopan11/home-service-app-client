<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const route = useRoute()

const title = computed(() => (route.name === 'admin-service-new' ? 'เพิ่มบริการ' : 'แก้ไขบริการ'))
</script>

<template>
  <AdminLayout active="services">
    <template #topbar>
      <h1 class="page-title">{{ title }}</h1>
    </template>
    <p class="hint">หน้ารอทำในรอบถัดไป</p>
  </AdminLayout>
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
