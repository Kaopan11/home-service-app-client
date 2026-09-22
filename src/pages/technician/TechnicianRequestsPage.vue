<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import {
  acceptRequest,
  declineRequest,
  getTechnicianProfile,
  listWaitingRequests,
  refreshTechnicianLocation,
} from '@/services/technician'
import { useTechnicianJobsStore } from '@/stores/technicianJobs'
import { isApiError } from '@/types/auth'
import type { TechnicianRequest } from '@/types/technician'

const jobsStore = useTechnicianJobsStore()

const loading = ref(true)
const refreshing = ref(false)
const actingId = ref<number | null>(null)
const error = ref('')
const address = ref('')
const requests = ref<TechnicianRequest[]>([])

onMounted(loadPage)

async function loadPage(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [profile, items] = await Promise.all([getTechnicianProfile(), listWaitingRequests()])
    address.value = profile.address ?? ''
    requests.value = items
    jobsStore.setPendingCount(items.length)
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถโหลดคำขอบริการซ่อมได้'
  } finally {
    loading.value = false
  }
}

function refreshLocation(): void {
  if (!navigator.geolocation) {
    error.value = 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง'
    return
  }

  error.value = ''
  refreshing.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const location = await refreshTechnicianLocation(
          position.coords.latitude,
          position.coords.longitude,
        )
        address.value = location.address
        const items = await listWaitingRequests()
        requests.value = items
        jobsStore.setPendingCount(items.length)
      } catch (err) {
        error.value = isApiError(err) ? err.message : 'ไม่สามารถรีเฟรชตำแหน่งได้'
      } finally {
        refreshing.value = false
      }
    },
    () => {
      error.value = 'ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง'
      refreshing.value = false
    },
  )
}

async function handleAccept(id: number): Promise<void> {
  if (actingId.value !== null) {
    return
  }
  actingId.value = id
  error.value = ''
  try {
    await acceptRequest(id)
    requests.value = requests.value.filter((item) => item.id !== id)
    jobsStore.setPendingCount(requests.value.length)
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถรับงานได้'
  } finally {
    actingId.value = null
  }
}

async function handleDecline(id: number): Promise<void> {
  if (actingId.value !== null) {
    return
  }
  actingId.value = id
  error.value = ''
  try {
    await declineRequest(id)
    requests.value = requests.value.filter((item) => item.id !== id)
    jobsStore.setPendingCount(requests.value.length)
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถปฏิเสธงานได้'
  } finally {
    actingId.value = null
  }
}

function formatWhen(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear() + 543
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} เวลา ${hours}.${minutes} น.`
}

function orderCode(id: number): string {
  return `ADO${String(id).padStart(7, '0')}`
}

function mapHref(request: TechnicianRequest): string {
  if (request.latitude != null && request.longitude != null) {
    return `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.address)}`
}
</script>

<template>
  <TechnicianLayout active="requests">
    <template #topbar>
      <h1 class="page-title">คำขอบริการซ่อม</h1>
    </template>

    <p v-if="error" class="banner banner--error" role="alert">{{ error }}</p>
    <p v-if="loading" class="banner">กำลังโหลดคำขอบริการซ่อม...</p>

    <div class="requests">
      <section class="location" aria-label="ตำแหน่งที่อยู่ปัจจุบัน">
        <span class="location__pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path
              d="M12 21s6.5-5.33 6.5-10.2A6.5 6.5 0 0 0 12 4.3a6.5 6.5 0 0 0-6.5 6.5C5.5 15.67 12 21 12 21Z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <circle cx="12" cy="10.6" r="2.2" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </span>
        <div class="location__copy">
          <p class="location__label">ตำแหน่งที่อยู่ปัจจุบัน</p>
          <p class="location__address">{{ address || 'ยังไม่ได้ระบุตำแหน่ง' }}</p>
        </div>
        <button
          type="button"
          class="btn btn--secondary location__refresh"
          :disabled="refreshing"
          @click="refreshLocation"
        >
          {{ refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช' }}
        </button>
      </section>

      <p v-if="!loading && !requests.length" class="empty">ยังไม่มีคำขอบริการซ่อม</p>

      <article v-for="request in requests" :key="request.id" class="card">
        <header class="card__head">
          <h2>{{ request.serviceName }}</h2>
          <p class="card__when">
            <span>วันเวลาดำเนินการ</span>
            {{ formatWhen(request.createdAt) }}
          </p>
        </header>

        <div class="card__body">
          <dl class="meta">
            <div>
              <dt>รายการ</dt>
              <dd>{{ request.serviceName }}</dd>
            </div>
            <div>
              <dt>รหัสคำสั่งซ่อม</dt>
              <dd>{{ orderCode(request.id) }}</dd>
            </div>
            <div>
              <dt>ราคารวม</dt>
              <dd>-</dd>
            </div>
            <div>
              <dt>สถานที่</dt>
              <dd>
                <span>{{ request.address }}</span>
                <a class="map-link" :href="mapHref(request)" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s6-4.9 6-9.4A6 6 0 0 0 6 11.6C6 16.1 12 21 12 21Z"
                      stroke="currentColor"
                      stroke-width="1.6"
                    />
                    <circle cx="12" cy="11.4" r="1.8" stroke="currentColor" stroke-width="1.6" />
                  </svg>
                  ดูแผนที่
                </a>
              </dd>
            </div>
          </dl>

          <div class="card__actions">
            <button
              type="button"
              class="btn btn--secondary"
              :disabled="actingId !== null"
              @click="handleDecline(request.id)"
            >
              ปฏิเสธ
            </button>
            <button
              type="button"
              class="btn btn--primary"
              :disabled="actingId !== null"
              @click="handleAccept(request.id)"
            >
              {{ actingId === request.id ? 'กำลังดำเนินการ...' : 'รับงาน' }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  color: var(--gray-950);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.banner {
  margin: 0 0 16px;
  color: var(--gray-700);
}

.banner--error {
  color: var(--red);
}

.requests {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
}

.location {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 88px;
  padding: 16px 20px;
  border-radius: 8px;
  background: var(--blue-100);
}

.location__pin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--blue-600);
  flex-shrink: 0;
}

.location__copy {
  min-width: 0;
  flex: 1;
}

.location__label {
  margin: 0;
  color: var(--gray-700);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
}

.location__address {
  margin: 0;
  color: var(--gray-950);
  font-size: 16px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.location__refresh {
  width: 112px;
  height: 44px;
  flex-shrink: 0;
}

.empty {
  margin: 8px 0 0;
  color: var(--gray-700);
}

.card {
  padding: 24px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
}

.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.card__head h2 {
  margin: 0;
  color: var(--gray-950);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.card__when {
  margin: 0;
  color: var(--gray-950);
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  white-space: nowrap;
}

.card__when span {
  margin-right: 12px;
  color: var(--gray-700);
}

.card__body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  min-width: 0;
}

.meta div {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;
}

.meta dt,
.meta dd {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.meta dt {
  color: var(--gray-700);
  font-weight: var(--font-weight-regular);
}

.meta dd {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  color: var(--gray-950);
  font-weight: var(--font-weight-medium);
}

.map-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--blue-600);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
}

.map-link:hover {
  color: var(--blue-700);
}

.card__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.card__actions .btn {
  width: 112px;
  height: 44px;
}

@media (max-width: 900px) {
  .location,
  .card__head,
  .card__body {
    flex-direction: column;
    align-items: stretch;
  }

  .card__when {
    white-space: normal;
  }

  .meta div {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .card__actions {
    justify-content: flex-end;
  }
}
</style>
