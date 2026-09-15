<script setup lang="ts">
import AdminLayout from '@/components/admin/AdminLayout.vue'
</script>

<template>
  <AdminLayout active="categories">
    <template #topbar>
      <h1 class="page-title">หมวดหมู่</h1>
    </template>
    <p class="hint">หน้านี้เป็น placeholder สำหรับงาน Admin Categories รอบถัดไป</p>
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
