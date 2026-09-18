<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import PromoFormFields from '@/components/admin/PromoFormFields.vue'
import { buildPromoPayload, type PromoFormState } from '@/data/adminPromos'
import { createPromotion } from '@/services/promoApi'

const router = useRouter()
const submitting = ref(false)
const error = ref('')

const form = reactive<PromoFormState>({
  code: '',
  discountType: 'fixed',
  fixedValue: '',
  percentValue: '',
  quota: '',
  expiryDate: null,
  expiryTime: null,
})

const canSubmit = computed(() => !submitting.value && Boolean(form.code.trim()))

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) {
    return
  }
  const result = buildPromoPayload(form)
  if ('error' in result) {
    error.value = result.error
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await createPromotion(result.payload)
    await router.push({ name: 'admin-promos' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถสร้าง Promotion Code ได้'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AdminLayout active="promos">
    <template #topbar>
      <h1 class="page-title">เพิ่ม Promotion Code</h1>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" @click="router.push({ name: 'admin-promos' })">
          ยกเลิก
        </button>
        <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'กำลังสร้าง...' : 'สร้าง' }}
        </button>
      </div>
    </template>

    <p v-if="error" class="error">{{ error }}</p>
    <form class="card" @submit.prevent="handleSubmit">
      <PromoFormFields
        v-model:code="form.code"
        v-model:discount-type="form.discountType"
        v-model:fixed-value="form.fixedValue"
        v-model:percent-value="form.percentValue"
        v-model:quota="form.quota"
        v-model:expiry-date="form.expiryDate"
        v-model:expiry-time="form.expiryTime"
      />
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
  overflow: visible;
}

</style>
