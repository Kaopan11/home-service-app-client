<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { createCategory } from '@/services/categoryApi'

const router = useRouter()
const name = ref('')
const submitting = ref(false)
const error = ref('')

const canSubmit = computed(() => Boolean(name.value.trim()) && !submitting.value)

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) {
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await createCategory(name.value.trim())
    await router.push({ name: 'admin-categories' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถสร้างหมวดหมู่ได้'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AdminLayout active="categories">
    <template #topbar>
      <h1 class="page-title">เพิ่มหมวดหมู่</h1>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" @click="router.back()">ยกเลิก</button>
        <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'กำลังสร้าง...' : 'สร้าง' }}
        </button>
      </div>
    </template>

    <p v-if="error" class="error">{{ error }}</p>
    <form class="card" @submit.prevent="handleSubmit">
      <div class="field">
        <label class="label" for="category-name">ชื่อหมวดหมู่<span>*</span></label>
        <input id="category-name" v-model="name" class="input" type="text" maxlength="255" />
      </div>
    </form>
  </AdminLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: #000000;
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

.error {
  margin: 0 0 16px;
  color: #c82438;
}

.card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 1120px;
  max-width: 100%;
  min-height: 124px;
  margin-top: 16px;
  padding: 40px 24px;
  gap: 40px;
  background: #ffffff;
  border: 1px solid #e6e7eb;
  border-radius: 8px;
}

.field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  width: 662px;
  height: 44px;
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
