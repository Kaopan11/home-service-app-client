<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { listCategories } from '@/services/categoryApi'
import { createAdminService, getAdminService, updateAdminService } from '@/services/adminServices'
import type { CategoryDto } from '@/types/category'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'admin-service-edit')
const serviceId = computed(() => Number(route.params.id))

const name = ref('')
const categoryId = ref<number | null>(null)
const categories = ref<CategoryDto[]>([])
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

const canSubmit = computed(() => Boolean(name.value.trim()) && categoryId.value !== null && !submitting.value)

onMounted(async () => {
  try {
    categories.value = await listCategories()
    if (isEdit.value) {
      const item = await getAdminService(serviceId.value)
      name.value = item.name
      categoryId.value = item.categoryId
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value || categoryId.value === null) {
    return
  }
  submitting.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await updateAdminService(serviceId.value, name.value.trim(), categoryId.value)
    } else {
      await createAdminService(name.value.trim(), categoryId.value)
    }
    await router.push({ name: 'admin-services' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถบันทึกบริการได้'
  } finally {
    submitting.value = false
  }
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
          <h1 class="page-title">{{ isEdit ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}</h1>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" @click="router.push({ name: 'admin-services' })">
          ยกเลิก
        </button>
        <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'กำลังบันทึก...' : 'ยืนยัน' }}
        </button>
      </div>
    </template>

    <p v-if="loading" class="status">กำลังโหลดข้อมูล...</p>
    <form v-else class="card" @submit.prevent="handleSubmit">
      <p v-if="error" class="status status--error">{{ error }}</p>
      <div class="row">
        <label class="label" for="service-name">ชื่อบริการ<span>*</span></label>
        <input id="service-name" v-model="name" class="input" type="text" maxlength="255" />
      </div>
      <div class="row">
        <label class="label" for="service-category">หมวดหมู่<span>*</span></label>
        <select id="service-category" v-model.number="categoryId" class="input">
          <option :value="null" disabled>เลือกหมวดหมู่</option>
          <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
            {{ category.name }}
          </option>
        </select>
      </div>
    </form>
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
  gap: 24px;
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
  width: 662px;
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
</style>
