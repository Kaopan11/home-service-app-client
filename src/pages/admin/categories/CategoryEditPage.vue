<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import AlertConfirmation from '@/components/admin/AlertConfirmation.vue'
import { formatAdminDateTime } from '@/data/adminServices'
import { deleteCategory, getCategory, updateCategory } from '@/services/categoryApi'
import type { CategoryDto } from '@/types/category'

const route = useRoute()
const router = useRouter()
const item = ref<CategoryDto | null>(null)
const name = ref('')
const loading = ref(true)
const submitting = ref(false)
const deleting = ref(false)
const showDelete = ref(false)
const error = ref('')

const canSubmit = computed(() => Boolean(name.value.trim()) && !submitting.value && Boolean(item.value))

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'ไม่พบข้อมูลหมวดหมู่'
    loading.value = false
    return
  }
  try {
    item.value = await getCategory(id)
    name.value = item.value.name
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายละเอียดหมวดหมู่ได้'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(): Promise<void> {
  if (!item.value || !canSubmit.value) {
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await updateCategory(item.value.category_id, name.value.trim())
    await router.push({ name: 'admin-categories' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถแก้ไขหมวดหมู่ได้'
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(): Promise<void> {
  if (!item.value) {
    return
  }
  deleting.value = true
  error.value = ''
  try {
    await deleteCategory(item.value.category_id)
    await router.push({ name: 'admin-categories' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถลบหมวดหมู่ได้'
  } finally {
    deleting.value = false
    showDelete.value = false
  }
}
</script>

<template>
  <AdminLayout active="categories">
    <template #topbar>
      <div class="heading-wrap">
        <button type="button" class="back" aria-label="กลับ" @click="router.push({ name: 'admin-categories' })">
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
          <p class="crumb">หมวดหมู่</p>
          <h1 class="page-title">{{ item?.name || 'แก้ไขหมวดหมู่' }}</h1>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" @click="router.push({ name: 'admin-categories' })">
          ยกเลิก
        </button>
        <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'กำลังบันทึก...' : 'ยืนยัน' }}
        </button>
      </div>
    </template>

    <p v-if="loading" class="status">กำลังโหลดรายละเอียดหมวดหมู่...</p>
    <p v-else-if="error && !item" class="status status--error">{{ error }}</p>
    <template v-else-if="item">
      <p v-if="error" class="status status--error">{{ error }}</p>
      <form class="card" @submit.prevent="handleSubmit">
        <div class="row row--name">
          <label class="label" for="category-name">ชื่อหมวดหมู่<span>*</span></label>
          <input id="category-name" v-model="name" class="input" type="text" maxlength="255" />
        </div>
        <div class="divider" />
        <div class="meta">
          <div class="row">
            <span class="label">สร้างเมื่อ</span>
            <span class="value">{{ formatAdminDateTime(item.created_at) }}</span>
          </div>
          <div class="row">
            <span class="label">แก้ไขล่าสุด</span>
            <span class="value">{{ formatAdminDateTime(item.updated_at) }}</span>
          </div>
        </div>
      </form>
      <div class="delete-wrap">
        <button type="button" class="delete-link" @click="showDelete = true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM10 11V17V11ZM14 11V17V11ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z"
              stroke="#80899C"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          ลบหมวดหมู่
        </button>
      </div>
    </template>

    <AlertConfirmation
      :open="showDelete"
      :item-name="item?.name ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
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

.topbar-actions {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  width: 248px;
}

.btn {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 112px;
  height: 44px;
  padding: 10px 24px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
  cursor: pointer;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn--primary {
  border: none;
  background: #336df2;
  color: #ffffff;
}

.btn--secondary {
  border: 1px solid #336df2;
  background: #ffffff;
  color: #336df2;
}

.status {
  margin: 0 0 16px;
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

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  height: 44px;
}

.row--name {
  width: 662px;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 387px;
}

.meta .row {
  width: 387px;
}

.label {
  width: 205px;
  height: 24px;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.label span {
  color: #c82438;
}

.input {
  box-sizing: border-box;
  width: 433px;
  height: 44px;
  padding: 10px 16px;
  border: 1px solid #ccd0d7;
  border-radius: 8px;
  background: #ffffff;
  color: #000000;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.input:focus {
  outline: none;
  border-color: #336df2;
}

.value {
  display: flex;
  align-items: center;
  height: 24px;
  color: #323640;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.divider {
  box-sizing: border-box;
  width: 100%;
  height: 0;
  align-self: stretch;
  border: none;
  border-top: 1px solid #ccd0d7;
}

.delete-wrap {
  display: flex;
  justify-content: flex-end;
  width: 1120px;
  max-width: 100%;
  margin-top: 24px;
}

.delete-link {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  width: 114px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #80899c;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  line-height: 150%;
  text-decoration: underline;
  cursor: pointer;
}

.delete-link svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
</style>
