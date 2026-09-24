<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AcceptJobConfirmation from '@/components/technician/AcceptJobConfirmation.vue'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import {
  acceptRequest,
  declineRequest,
  getTechnicianProfile,
  listWaitingRequests,
  refreshTechnicianLocation,
  updateTechnicianProfile,
} from '@/services/technician'
import { icons } from '@/constants/icons'
import { useTechnicianJobsStore } from '@/stores/technicianJobs'
import { isApiError } from '@/types/auth'
import type { TechnicianProfile, TechnicianRequest } from '@/types/technician'

const jobsStore = useTechnicianJobsStore()

const loading = ref(true)
const refreshing = ref(false)
const enabling = ref(false)
const actingId = ref<number | null>(null)
const pendingAccept = ref<TechnicianRequest | null>(null)
const error = ref('')
const address = ref('')
const available = ref(true)
const profile = ref<TechnicianProfile | null>(null)
const requests = ref<TechnicianRequest[]>([])

onMounted(loadPage)

async function loadPage(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const nextProfile = await getTechnicianProfile()
    profile.value = nextProfile
    address.value = nextProfile.address ?? ''
    available.value = nextProfile.available
    if (!nextProfile.available) {
      requests.value = []
      jobsStore.setPendingCount(0)
      return
    }
    const items = await listWaitingRequests()
    requests.value = items
    jobsStore.setPendingCount(items.length)
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถโหลดคำขอบริการซ่อมได้'
  } finally {
    loading.value = false
  }
}

async function enableAvailability(): Promise<void> {
  const current = profile.value
  if (!current || enabling.value) {
    return
  }

  enabling.value = true
  error.value = ''
  try {
    const updated = await updateTechnicianProfile({
      firstName: current.firstName ?? '',
      lastName: current.lastName ?? '',
      phone: current.phone ?? '',
      address: current.address ?? '',
      latitude: current.latitude,
      longitude: current.longitude,
      available: true,
      serviceIds: [...current.acceptedServiceIds],
    })
    profile.value = updated
    available.value = updated.available
    address.value = updated.address ?? ''
    if (updated.available) {
      const items = await listWaitingRequests()
      requests.value = items
      jobsStore.setPendingCount(items.length)
    }
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถเปลี่ยนสถานะได้'
  } finally {
    enabling.value = false
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

function openAcceptModal(request: TechnicianRequest): void {
  if (actingId.value !== null) {
    return
  }
  pendingAccept.value = request
}

function closeAcceptModal(): void {
  if (actingId.value !== null) {
    return
  }
  pendingAccept.value = null
}

async function confirmAccept(): Promise<void> {
  const request = pendingAccept.value
  if (!request || actingId.value !== null) {
    return
  }
  actingId.value = request.id
  error.value = ''
  try {
    await acceptRequest(request.id)
    requests.value = requests.value.filter((item) => item.id !== request.id)
    jobsStore.setPendingCount(requests.value.length)
    pendingAccept.value = null
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

    <section v-if="!loading && !available" class="unavailable">
      <span class="unavailable__bell" aria-hidden="true"></span>
      <h2>ต้องการรับแจ้งเตือนคำขอบริการสั่งซ่อม?</h2>
      <p>เปิดใช้งานสถานะพร้อมให้บริการเพื่อแสดงรายการและรับงานซ่อมในบริเวณตำแหน่งที่คุณอยู่</p>
      <p v-if="error" class="unavailable__error" role="alert">{{ error }}</p>
      <button type="button" class="btn btn--primary" :disabled="enabling" @click="enableAvailability">
        {{ enabling ? 'กำลังเปลี่ยนสถานะ...' : 'เปลี่ยนสถานะเป็นพร้อมให้บริการ' }}
      </button>
    </section>

    <div v-else class="requests">
      <section class="location" aria-label="ตำแหน่งที่อยู่ปัจจุบัน">
        <img
          class="location__pin"
          :src="icons.technician.location"
          width="27"
          height="34"
          alt=""
        />
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

      <p v-if="error" class="empty empty--error" role="alert">{{ error }}</p>
      <p v-if="loading || refreshing" class="empty">กำลังโหลดคำขอบริการซ่อม...</p>
      <p v-else-if="!requests.length" class="empty">ยังไม่มีคำขอบริการซ่อม</p>

      <article v-for="request in requests" :key="request.id" class="request">
        <header class="request__head">
          <h2>{{ request.serviceName }}</h2>
          <p class="request__when">
            <span>วันเวลาดำเนินการ</span>
            {{ formatWhen(request.createdAt) }}
          </p>
        </header>

        <div class="request__body">
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
                  <img :src="icons.technician.location" width="14" height="18" alt="" />
                  ดูแผนที่
                </a>
              </dd>
            </div>
          </dl>

          <div class="request__actions">
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
              @click="openAcceptModal(request)"
            >
              รับงาน
            </button>
          </div>
        </div>
      </article>
    </div>

    <AcceptJobConfirmation
      :open="Boolean(pendingAccept)"
      :service-name="pendingAccept?.serviceName ?? ''"
      :scheduled-at="pendingAccept?.createdAt ?? ''"
      :loading="actingId !== null"
      @confirm="confirmAccept"
      @cancel="closeAcceptModal"
    />
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  color: var(--gray-950);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.unavailable {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  padding: 48px 24px 40px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  text-align: center;
}

.unavailable__bell {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  background-color: var(--blue-600);
  -webkit-mask: url('/icons/notification/notification-filled.svg') center / contain no-repeat;
  mask: url('/icons/notification/notification-filled.svg') center / contain no-repeat;
}

.unavailable h2 {
  margin: 0;
  color: var(--gray-950);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.unavailable p {
  margin: 0;
  max-width: 720px;
  color: var(--gray-600);
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
}

.unavailable .unavailable__error {
  color: var(--red);
}

.unavailable .btn {
  width: auto;
  min-width: 240px;
  height: 44px;
  margin-top: 16px;
  padding: 0 24px;
}

.requests {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
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
  width: 27px;
  height: 34px;
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

.location__refresh,
.location__refresh:hover:not(:disabled),
.location__refresh:active:not(:disabled),
.location__refresh:disabled {
  width: 112px;
  height: 44px;
  flex-shrink: 0;
  background: var(--blue-100);
}

.empty {
  margin: 8px 0 0;
  color: var(--gray-700);
}

.empty--error {
  margin-bottom: 0;
  color: var(--red);
}

.request {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  padding: 24px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
}

.request__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.request__head h2 {
  margin: 0;
  color: var(--gray-950);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.request__when {
  margin: 0;
  color: var(--gray-950);
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  white-space: nowrap;
}

.request__when span {
  margin-right: 12px;
  color: var(--gray-700);
}

.request__body {
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

.map-link img {
  width: 14px;
  height: 18px;
  flex-shrink: 0;
}

.map-link:hover {
  color: var(--blue-700);
}

.request__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.request__actions .btn {
  width: 112px;
  height: 44px;
}

@media (max-width: 900px) {
  .location,
  .request__head,
  .request__body {
    flex-direction: column;
    align-items: stretch;
  }

  .request__when {
    white-space: normal;
  }

  .meta div {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .request__actions {
    justify-content: flex-end;
  }
}
</style>
