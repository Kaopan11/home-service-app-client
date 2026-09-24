<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { formatAdminDateTime } from '@/data/adminServices'
import { getAdminService } from '@/services/adminServices'
import type { AdminServiceItem } from '@/types/adminService'

const route = useRoute()
const router = useRouter()
const item = ref<AdminServiceItem | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'ไม่พบข้อมูลบริการ'
    loading.value = false
    return
  }
  try {
    item.value = await getAdminService(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายละเอียดบริการได้'
  } finally {
    loading.value = false
  }
})

function formatPrice(price: number): string {
  return Number(price).toFixed(2)
}
</script>

<template>
  <AdminLayout active="services">
    <template #topbar>
      <div class="heading-wrap">
        <button type="button" class="back" aria-label="กลับ" @click="router.push({ name: 'admin-services' })">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 5L8.5 12L14.5 19"
              stroke="#646C80"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="heading">
          <p class="crumb">บริการ</p>
          <h1 class="page-title">{{ item?.name || 'รายละเอียดบริการ' }}</h1>
        </div>
      </div>
      <button
        v-if="item"
        type="button"
        class="btn"
        @click="router.push({ name: 'admin-service-edit', params: { id: String(item.id) } })"
      >
        แก้ไข
      </button>
    </template>

    <p v-if="loading" class="status">กำลังโหลดรายละเอียดบริการ...</p>
    <p v-else-if="error" class="status status--error">{{ error }}</p>
    <div v-else-if="item" class="card">
      <div class="fields">
        <div class="row">
          <span class="label">ชื่อบริการ</span>
          <span class="value">{{ item.name }}</span>
        </div>
        <div class="row">
          <span class="label">หมวดหมู่</span>
          <span class="value">{{ item.categoryName }}</span>
        </div>
      </div>
      <div class="row row--image">
        <span class="label">รูปภาพ</span>
        <div v-if="item.imageUrl" class="photo">
          <img :src="item.imageUrl" :alt="item.name" />
        </div>
        <span v-else class="value value--muted">ไม่มีรูปภาพ</span>
      </div>
      <div class="divider" />
      <h2 class="section-title">รายการบริการย่อย</h2>
      <p v-if="!item.options?.length" class="value value--muted">ยังไม่มีรายการบริการย่อย</p>
      <div v-else class="options">
        <div v-for="option in item.options" :key="option.id ?? option.name" class="option">
          <div class="option-field option-field--name">
            <span>ชื่อรายการ</span>
            <p>{{ option.name }}</p>
          </div>
          <div class="option-field">
            <span>หน่วยการบริการ</span>
            <p>{{ option.unit }}</p>
          </div>
          <div class="option-field">
            <span>ค่าบริการ / 1 หน่วย</span>
            <p>{{ formatPrice(option.price) }}</p>
          </div>
        </div>
      </div>
      <div class="divider" />
      <div class="meta">
        <div class="row">
          <span class="label">สร้างเมื่อ</span>
          <span class="value value--date">{{ formatAdminDateTime(item.createdAt) }}</span>
        </div>
        <div class="row">
          <span class="label">แก้ไขล่าสุด</span>
          <span class="value value--date">{{ formatAdminDateTime(item.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.heading-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}

.back {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 48px;
}

.crumb {
  margin: 0;
  height: 18px;
  color: #646c80;
  font-size: 12px;
  font-weight: 400;
  line-height: 150%;
}

.page-title {
  margin: 0;
  height: 30px;
  color: #232630;
  font-size: 20px;
  font-weight: 500;
  line-height: 150%;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 112px;
  height: 44px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #336df2;
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
  cursor: pointer;
}

.status {
  margin: 0;
  color: #646c80;
}

.status--error {
  color: #c82438;
}

.card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 1120px;
  max-width: 100%;
  margin-top: 16px;
  padding: 16px 24px 40px;
  gap: 40px;
  background: #ffffff;
  border: 1px solid #e6e7eb;
  border-radius: 8px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  min-height: 44px;
}

.row--image {
  align-items: flex-start;
  width: 662px;
}

.label {
  width: 205px;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.value {
  color: #000000;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.value--date {
  color: #323640;
}

.value--muted {
  color: #646c80;
}

.photo {
  width: 300px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.divider {
  width: 100%;
  border-top: 1px solid #ccd0d7;
}

.section-title {
  margin: 0;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}

.option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px 240px;
  gap: 12px;
  width: 100%;
}

.option-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.option-field span {
  color: #646c80;
  font-size: 14px;
  font-weight: 400;
  line-height: 150%;
}

.option-field p {
  margin: 0;
  color: #000000;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 900px) {
  .option {
    grid-template-columns: 1fr;
  }
}
</style>
