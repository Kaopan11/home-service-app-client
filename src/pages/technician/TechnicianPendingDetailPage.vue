<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import { completeTechnicianJob, getTechnicianJobDetail } from '@/services/technician'
import type { TechnicianJobDetail } from '@/types/technician'
import { formatThaiCurrency, formatThaiDateTime } from '@/utils/technicianFormatters'

const route = useRoute()
const router = useRouter()

const jobId = Number(route.params.id)
const job = ref<TechnicianJobDetail | null>(null)
const loading = ref(true)
const error = ref('')
const completing = ref(false)
const completeSuccess = ref(false)

onMounted(loadJob)

async function loadJob(): Promise<void> {
  if (Number.isNaN(jobId)) {
    error.value = 'รหัสคำสั่งซ่อมไม่ถูกต้อง'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  try {
    job.value = await getTechnicianJobDetail(jobId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายละเอียดคำสั่งซ่อมได้'
  } finally {
    loading.value = false
  }
}

async function handleCompleteJob(): Promise<void> {
  if (!job.value || completing.value) return

  const confirmed = window.confirm('คุณต้องการยืนยันว่าดำเนินการซ่อมเรียบร้อยแล้วใช่หรือไม่?')
  if (!confirmed) return

  completing.value = true
  error.value = ''
  try {
    const updated = await completeTechnicianJob(job.value.id)
    job.value = updated
    completeSuccess.value = true
    setTimeout(() => {
      void router.push({ name: 'technician-history' })
    }, 1200)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถบันทึกการจบงานได้'
  } finally {
    completing.value = false
  }
}

function openMap(): void {
  if (!job.value) return
  const query = job.value.latitude && job.value.longitude
    ? `${job.value.latitude},${job.value.longitude}`
    : job.value.address
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
}
</script>

<template>
  <TechnicianLayout active="jobs">
    <template #topbar>
      <div class="topbar-nav">
        <button
          type="button"
          class="back-btn"
          aria-label="ย้อนกลับ"
          @click="router.push({ name: 'technician-jobs' })"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="breadcrumb">
          <span class="breadcrumb-sub">รายการที่รอดำเนินการ</span>
          <span class="breadcrumb-main">{{ job?.serviceName || 'รายละเอียดคำสั่งซ่อม' }}</span>
        </div>
      </div>
    </template>

    <div class="detail-container">
      <div v-if="loading" class="state-box">
        <p>กำลังโหลดรายละเอียด...</p>
      </div>

      <div v-else-if="error" class="state-box state-box--error">
        <p>{{ error }}</p>
        <button type="button" class="back-link-btn" @click="router.push({ name: 'technician-jobs' })">
          กลับไปยังรายการที่รอดำเนินการ
        </button>
      </div>

      <div v-else-if="job" class="card">
        <!-- Service Title -->
        <h2 class="card-title">{{ job.serviceName }}</h2>

        <!-- Details Grid -->
        <div class="detail-grid">
          <!-- Category -->
          <div class="detail-row">
            <span class="label">หมวดหมู่</span>
            <div class="value">
              <span class="category-badge">{{ job.categoryName || 'บริการทั่วไป' }}</span>
            </div>
          </div>

          <!-- Items / Description -->
          <div class="detail-row">
            <span class="label">รายการ</span>
            <span class="value">{{ job.itemsDescription || job.serviceName }}</span>
          </div>

          <!-- Scheduled Date / Time -->
          <div class="detail-row">
            <span class="label">วันเวลาดำเนินการ</span>
            <span class="value">{{ formatThaiDateTime(job.scheduledAt) }}</span>
          </div>

          <!-- Location -->
          <div class="detail-row">
            <span class="label">สถานที่</span>
            <div class="value location-value">
              <span>{{ job.address }}</span>
              <button type="button" class="map-link-btn" @click="openMap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>ดูแผนที่</span>
              </button>
            </div>
          </div>

          <!-- Order Code -->
          <div class="detail-row">
            <span class="label">รหัสคำสั่งซ่อม</span>
            <span class="value value--code">{{ job.orderCode }}</span>
          </div>

          <!-- Total Price -->
          <div class="detail-row">
            <span class="label">ราคารวม</span>
            <span class="value value--price">{{ formatThaiCurrency(job.totalPrice) }}</span>
          </div>

          <!-- Customer Name -->
          <div class="detail-row">
            <span class="label">ผู้รับบริการ</span>
            <span class="value">{{ job.customerName }}</span>
          </div>

          <!-- Customer Phone -->
          <div class="detail-row">
            <span class="label">เบอร์ติดต่อ</span>
            <span class="value">{{ job.customerPhone || '-' }}</span>
          </div>
        </div>

        <!-- Action / Complete Button -->
        <div class="card-footer">
          <p v-if="completeSuccess" class="success-msg">
            ดำเนินการเสร็จสิ้นเรียบร้อย กำลังนำทางไปยังประวัติการซ่อม...
          </p>
          <button
            v-else-if="job.status === 'ACCEPTED'"
            type="button"
            class="complete-btn"
            :disabled="completing"
            @click="handleCompleteJob"
          >
            {{ completing ? 'กำลังบันทึก...' : 'ดำเนินการเสร็จสิ้น' }}
          </button>
        </div>
      </div>
    </div>
  </TechnicianLayout>
</template>

<style scoped>
.topbar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.15s ease;
}

.back-btn:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.breadcrumb {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.breadcrumb-sub {
  font-size: 12px;
  color: var(--gray-500);
}

.breadcrumb-main {
  font-size: 18px;
  font-weight: var(--font-weight-medium);
  color: var(--gray-900);
}

.detail-container {
  max-width: 960px;
}

.card {
  padding: 36px 40px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.card-title {
  margin: 0 0 28px;
  font-size: 20px;
  font-weight: var(--font-weight-medium);
  color: var(--gray-900);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.detail-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  align-items: flex-start;
  gap: 16px;
  font-size: 15px;
}

.label {
  color: var(--gray-600);
  line-height: 1.5;
}

.value {
  color: var(--gray-900);
  line-height: 1.5;
}

.value--code {
  color: var(--gray-700);
}

.value--price {
  font-weight: var(--font-weight-medium);
  color: var(--gray-900);
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--blue-100);
  color: var(--blue-700);
  border-radius: 999px;
  font-size: 13px;
  font-weight: var(--font-weight-medium);
}

.location-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 0;
  color: var(--blue-600);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  width: fit-content;
}

.map-link-btn:hover {
  text-decoration: underline;
  color: var(--blue-700);
}

.card-footer {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
}

.complete-btn {
  padding: 12px 28px;
  background: var(--blue-600);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.complete-btn:hover:not(:disabled) {
  background: var(--blue-700);
}

.complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-msg {
  color: var(--blue-700);
  font-weight: var(--font-weight-medium);
}

.state-box {
  padding: 48px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  text-align: center;
  color: var(--gray-600);
}

.state-box--error {
  color: var(--red);
}

.back-link-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--blue-600);
  color: var(--white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 640px) {
  .card {
    padding: 24px 20px;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
