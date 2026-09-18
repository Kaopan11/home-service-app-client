<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { formatPromoDiscount, formatPromoQuota, formatPromoType } from '@/data/adminPromos'
import { formatAdminDateTime } from '@/data/adminServices'
import { getPromotion } from '@/services/promoApi'
import type { PromotionDto } from '@/types/promo'

const route = useRoute()
const router = useRouter()
const item = ref<PromotionDto | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'ไม่พบข้อมูล Promotion Code'
    loading.value = false
    return
  }
  try {
    item.value = await getPromotion(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายละเอียด Promotion Code ได้'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout active="promos">
    <template #topbar>
      <div class="heading-wrap">
        <button type="button" class="back" aria-label="กลับ" @click="router.push({ name: 'admin-promos' })">
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
          <p class="crumb">Promotion Code</p>
          <h1 class="page-title">{{ item?.code || 'รายละเอียด Promotion Code' }}</h1>
        </div>
      </div>
      <button
        v-if="item"
        type="button"
        class="btn"
        @click="router.push({ name: 'admin-promo-edit', params: { id: String(item.promotion_id) } })"
      >
        แก้ไข
      </button>
    </template>

    <p v-if="loading" class="status">กำลังโหลดรายละเอียด Promotion Code...</p>
    <p v-else-if="error" class="status status--error">{{ error }}</p>
    <div v-else-if="item" class="card">
      <div class="details">
        <div class="row">
          <span class="label">Promotion Code</span>
          <span class="value">{{ item.code }}</span>
        </div>
        <div class="row">
          <span class="label">ประเภท</span>
          <span class="value">{{ formatPromoType(item.discount_type) }}</span>
        </div>
        <div class="row">
          <span class="label">ราคาที่ลด</span>
          <span class="value value--discount">
            {{ formatPromoDiscount(item.discount_type, item.discount_value) }}
          </span>
        </div>
        <div class="row">
          <span class="label">โควต้าการใช้</span>
          <span class="value">{{ formatPromoQuota(item.quota_used, item.quota_limit, true) }}</span>
        </div>
        <div class="row">
          <span class="label">วันหมดอายุ</span>
          <span class="value">{{ formatAdminDateTime(item.expires_at) }}</span>
        </div>
      </div>
      <div class="divider" />
      <div class="meta">
        <div class="row">
          <span class="label">สร้างเมื่อ</span>
          <span class="value value--date">{{ formatAdminDateTime(item.created_at) }}</span>
        </div>
        <div class="row">
          <span class="label">แก้ไขล่าสุด</span>
          <span class="value value--date">{{ formatAdminDateTime(item.updated_at) }}</span>
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
  min-height: 304px;
  margin-top: 16px;
  padding: 40px 24px;
  gap: 40px;
  background: #ffffff;
  border: 1px solid #e6e7eb;
  border-radius: 8px;
}

.details,
.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  min-height: 24px;
}

.label {
  width: 205px;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.value {
  display: flex;
  align-items: center;
  color: #000000;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.value--discount {
  color: #c82438;
}

.value--date {
  color: #323640;
}

.divider {
  box-sizing: border-box;
  width: 100%;
  height: 0;
  align-self: stretch;
  border: none;
  border-top: 1px solid #ccd0d7;
}
</style>
