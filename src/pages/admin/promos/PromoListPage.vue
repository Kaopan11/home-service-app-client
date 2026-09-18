<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import AlertConfirmation from '@/components/admin/AlertConfirmation.vue'
import { icons } from '@/constants/icons'
import { formatPromoDiscount, formatPromoQuota, formatPromoType } from '@/data/adminPromos'
import { formatAdminDateTime } from '@/data/adminServices'
import { deletePromotion, listPromotions } from '@/services/promoApi'
import type { PromotionDto } from '@/types/promo'

const router = useRouter()
const query = ref('')
const rows = ref<PromotionDto[]>([])
const loading = ref(true)
const error = ref('')
const pendingDelete = ref<PromotionDto | null>(null)
const deleting = ref(false)

const visibleRows = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) {
    return rows.value
  }
  return rows.value.filter(
    (item) =>
      item.code.toLowerCase().includes(needle) || formatPromoType(item.discount_type).toLowerCase().includes(needle),
  )
})

onMounted(loadPromos)

async function loadPromos(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    rows.value = await listPromotions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูล Promotion Code ได้'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function goDetail(item: PromotionDto): void {
  void router.push({ name: 'admin-promo-detail', params: { id: String(item.promotion_id) } })
}

function goEdit(item: PromotionDto): void {
  void router.push({ name: 'admin-promo-edit', params: { id: String(item.promotion_id) } })
}

async function confirmDelete(): Promise<void> {
  if (!pendingDelete.value) {
    return
  }
  deleting.value = true
  error.value = ''
  try {
    await deletePromotion(pendingDelete.value.promotion_id)
    rows.value = rows.value.filter((row) => row.promotion_id !== pendingDelete.value?.promotion_id)
    pendingDelete.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถลบ Promotion Code ได้'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AdminLayout active="promos">
    <template #topbar>
      <h1 class="page-title">Promotion Code</h1>
      <label class="search">
        <img :src="icons.admin.search" width="24" height="24" alt="" />
        <input v-model="query" type="search" placeholder="ค้นหา Promotion Code..." />
      </label>
      <button type="button" class="add-btn" @click="router.push({ name: 'admin-promo-new' })">
        เพิ่ม Promotion Code
        <img :src="icons.admin.plus" width="20" height="20" alt="" />
      </button>
    </template>

    <p v-if="loading" class="status">กำลังโหลดข้อมูล Promotion Code...</p>
    <p v-else-if="!rows.length && error" class="status status--error">{{ error }}</p>
    <p v-else-if="!rows.length" class="status">ยังไม่มี Promotion Code</p>
    <template v-else>
      <p v-if="error" class="status status--error">{{ error }}</p>
      <p v-if="!visibleRows.length" class="status">ไม่พบ Promotion Code ที่ตรงกับการค้นหา</p>
      <div v-else class="table-wrap">
        <table class="promo-table">
          <thead>
            <tr>
              <th class="col-code">Promotion Code</th>
              <th class="col-type">ประเภท</th>
              <th class="col-quota">โควต้าการใช้(ครั้ง)</th>
              <th class="col-discount">ราคาที่ลด</th>
              <th class="col-date">สร้างเมื่อ</th>
              <th class="col-date">วันหมดอายุ</th>
              <th class="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleRows" :key="item.promotion_id">
              <td class="cell-link" @click="goDetail(item)">{{ item.code }}</td>
              <td class="cell-link" @click="goDetail(item)">{{ formatPromoType(item.discount_type) }}</td>
              <td class="cell-link" @click="goDetail(item)">
                {{ formatPromoQuota(item.quota_used, item.quota_limit) }}
              </td>
              <td class="cell-link discount" @click="goDetail(item)">
                {{ formatPromoDiscount(item.discount_type, item.discount_value) }}
              </td>
              <td class="cell-link" @click="goDetail(item)">{{ formatAdminDateTime(item.created_at) }}</td>
              <td class="cell-link" @click="goDetail(item)">{{ formatAdminDateTime(item.expires_at) }}</td>
              <td class="col-action">
                <button type="button" class="icon-btn" aria-label="ลบ" @click="pendingDelete = item">
                  <img :src="icons.admin.trash" width="24" height="24" alt="" />
                </button>
                <button type="button" class="icon-btn" aria-label="แก้ไข" @click="goEdit(item)">
                  <img :src="icons.admin.edit" width="24" height="24" alt="" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <AlertConfirmation
      :open="Boolean(pendingDelete)"
      :item-name="pendingDelete?.code ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </AdminLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: var(--black);
  font-size: var(--headline-2-size);
  font-weight: var(--font-weight-medium);
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 350px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
}

.search img {
  width: 24px;
  height: 24px;
}

.search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--gray-800);
  font: inherit;
}

.search input::placeholder {
  color: var(--gray-500);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 8px;
  background: var(--blue-600);
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.status {
  margin: 0 0 16px;
  color: var(--gray-700);
}

.status--error {
  color: var(--red);
}

.table-wrap {
  width: 1120px;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--white);
}

.promo-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.promo-table th {
  height: 41px;
  padding: 0 16px;
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: var(--body-3-size);
  font-weight: var(--font-weight-regular);
  text-align: left;
}

.promo-table td {
  height: 88px;
  padding: 0 16px;
  border-top: 1px solid var(--gray-200);
  color: var(--black);
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-light);
  vertical-align: middle;
}

.col-code {
  width: 180px;
}

.col-type {
  width: 110px;
}

.col-quota {
  width: 160px;
}

.col-discount {
  width: 120px;
}

.col-date {
  width: 190px;
}

.col-action {
  width: 120px;
  text-align: center;
}

.discount {
  color: var(--red);
}

.cell-link {
  cursor: pointer;
}

.icon-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.icon-btn + .icon-btn {
  margin-left: 24px;
}

.icon-btn img {
  width: 24px;
  height: 24px;
  display: block;
}
</style>
