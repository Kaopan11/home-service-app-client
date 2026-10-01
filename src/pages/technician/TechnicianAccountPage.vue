<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import {
  getTechnicianProfile,
  refreshTechnicianLocation,
  updateTechnicianProfile,
} from '@/services/technician'
import { useAuthStore } from '@/stores/auth'
import { useTechnicianJobsStore } from '@/stores/technicianJobs'
import { isApiError, type AdminUser } from '@/types/auth'
import type { TechnicianProfile, TechnicianServiceOption } from '@/types/technician'
import { getStoredAccessToken } from '@/utils/authStorage'

type FormState = {
  firstName: string
  lastName: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  available: boolean
  serviceIds: number[]
}

const auth = useAuthStore()
const jobsStore = useTechnicianJobsStore()

const loading = ref(true)
const submitting = ref(false)
const refreshing = ref(false)
const error = ref('')
const success = ref('')
const services = ref<TechnicianServiceOption[]>([])

const form = reactive<FormState>(emptyForm())
const snapshot = ref<FormState>(emptyForm())

const canSubmit = computed(
  () =>
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    Boolean(form.phone.trim()) &&
    Boolean(form.address.trim()) &&
    !submitting.value &&
    !loading.value,
)

onMounted(loadProfile)

function emptyForm(): FormState {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    available: true,
    serviceIds: [],
  }
}

function applyProfile(profile: TechnicianProfile): void {
  services.value = profile.services
  const next: FormState = {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    latitude: profile.latitude,
    longitude: profile.longitude,
    available: profile.available,
    serviceIds: [...profile.acceptedServiceIds],
  }
  Object.assign(form, next)
  snapshot.value = { ...next, serviceIds: [...next.serviceIds] }
}

function applyFallback(): void {
  const user = auth.user
  services.value = []
  const next: FormState = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    latitude: null,
    longitude: null,
    available: true,
    serviceIds: [],
  }
  Object.assign(form, next)
  snapshot.value = { ...next, serviceIds: [] }
}

function toAdminUser(profile: TechnicianProfile): AdminUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    address: profile.address,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  }
}

async function loadProfile(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    applyProfile(await getTechnicianProfile())
  } catch (err) {
    applyFallback()
    const token = getStoredAccessToken()
    if (!token?.startsWith('demo-')) {
      error.value = isApiError(err) ? err.message : 'ไม่สามารถโหลดข้อมูลบัญชีได้'
    }
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  error.value = ''
  success.value = ''
  Object.assign(form, {
    ...snapshot.value,
    serviceIds: [...snapshot.value.serviceIds],
  })
}

function toggleService(id: number): void {
  if (form.serviceIds.includes(id)) {
    form.serviceIds = form.serviceIds.filter((item) => item !== id)
    return
  }
  form.serviceIds = [...form.serviceIds, id]
}

function refreshLocation(): void {
  if (!navigator.geolocation) {
    error.value = 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง'
    return
  }

  error.value = ''
  success.value = ''
  refreshing.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const location = await refreshTechnicianLocation(
          position.coords.latitude,
          position.coords.longitude,
        )
        form.address = location.address
        form.latitude = location.latitude
        form.longitude = location.longitude
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

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) {
    return
  }

  submitting.value = true
  error.value = ''
  success.value = ''
  try {
    const profile = await updateTechnicianProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      available: form.available,
      serviceIds: [...form.serviceIds],
    })
    applyProfile(profile)
    auth.updateUser(toAdminUser(profile))
    await jobsStore.refreshPendingCount()
    success.value = 'บันทึกข้อมูลเรียบร้อยแล้ว'
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <TechnicianLayout active="account">
    <template #topbar>
      <h1 class="page-title">ตั้งค่าบัญชีผู้ใช้</h1>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" :disabled="submitting" @click="resetForm">
          ยกเลิก
        </button>
        <button type="button" class="btn btn--primary" :disabled="!canSubmit" @click="handleSubmit">
          {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
      </div>
    </template>

    <p v-if="error" class="banner banner--error" role="alert">{{ error }}</p>
    <p v-else-if="success" class="banner banner--success" role="status">{{ success }}</p>
    <p v-if="loading" class="banner">กำลังโหลดข้อมูลบัญชี...</p>

    <form class="panel" @submit.prevent="handleSubmit">
      <section class="block">
        <h2 class="block__title">รายละเอียดบัญชี</h2>
        <div class="block__body">
          <label class="row">
            <span>ชื่อ<em>*</em></span>
            <input v-model="form.firstName" type="text" name="firstName" autocomplete="given-name" />
          </label>
          <label class="row">
            <span>นามสกุล<em>*</em></span>
            <input v-model="form.lastName" type="text" name="lastName" autocomplete="family-name" />
          </label>
          <label class="row">
            <span>เบอร์ติดต่อ<em>*</em></span>
            <input v-model="form.phone" type="tel" name="phone" autocomplete="tel" />
          </label>
          <div class="row">
            <span>ตำแหน่งที่อยู่ปัจจุบัน<em>*</em></span>
            <div class="location">
              <input :value="form.address" type="text" name="address" disabled />
              <button
                type="button"
                class="btn btn--secondary location__refresh"
                :disabled="refreshing"
                @click="refreshLocation"
              >
                {{ refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">สถานะบัญชี</h2>
        <div class="block__body">
          <div class="availability">
            <button
              type="button"
              class="switch"
              role="switch"
              aria-label="พร้อมให้บริการ"
              :aria-checked="form.available"
              @click="form.available = !form.available"
            />
            <div class="availability__copy">
              <p class="availability__label">พร้อมให้บริการ</p>
              <p class="availability__hint">
                ระบบจะแสดงคำสั่งซ่อมในบริเวณใกล้เคียงตำแหน่งที่อยู่ปัจจุบัน ให้สามารถเลือกงานได้
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2 class="block__title">บริการที่รับซ่อม</h2>
        <div class="block__body">
          <p v-if="!services.length" class="empty">ยังไม่มีบริการให้เลือก</p>
          <label v-for="service in services" :key="service.id" class="check">
            <input
              type="checkbox"
              :checked="form.serviceIds.includes(service.id)"
              @change="toggleService(service.id)"
            />
            <span>{{ service.name }}</span>
          </label>
        </div>
      </section>
    </form>
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: var(--gray-800);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.topbar-actions .btn {
  width: 112px;
  height: 44px;
  padding: 10px 24px;
}

.banner {
  margin: 0 0 16px;
  color: var(--gray-700);
}

.banner--error {
  color: var(--red);
}

.banner--success {
  color: var(--green-900);
}

.panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1120px;
  padding: 32px 24px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
}

.block {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 24px 32px;
  padding: 24px 0;
}

.block:first-child {
  padding-top: 0;
}

.block:last-child {
  padding-bottom: 0;
}

.block + .block {
  border-top: 1px solid var(--gray-300);
}

.block__title {
  margin: 0;
  color: var(--gray-800);
  font-size: 16px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.block__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.row {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  align-items: center;
  gap: 16px 24px;
}

.row > span,
.check {
  color: var(--gray-700);
  font-size: 16px;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.row > span {
  min-width: 0;
}

.row > span em {
  color: var(--red);
  font-style: normal;
}

.row input,
.location input {
  box-sizing: border-box;
  width: 100%;
  max-width: 433px;
  height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  color: var(--gray-950);
  font-family: inherit;
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
}

.row input:focus {
  outline: none;
  border-color: var(--blue-600);
}

.location {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  width: 100%;
  flex-wrap: wrap;
}

.location input {
  flex: 1 1 0;
  width: auto;
  min-width: 80px;
  max-width: 433px;
}

.location input:disabled {
  color: var(--gray-500);
  background: var(--white);
}

.location__refresh {
  width: 112px;
  height: 44px;
  padding: 10px 16px;
  flex-shrink: 0;
}

.availability {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: transparent;
}

.switch {
  position: relative;
  width: 36px;
  height: 20px;
  margin-top: 2px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--gray-300);
  cursor: pointer;
  flex-shrink: 0;
}

.switch[aria-checked='true'] {
  background: var(--blue-500);
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  transition: transform 0.15s ease;
}

.switch[aria-checked='true']::after {
  transform: translateX(16px);
}

.availability__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: transparent;
}

.availability__label {
  margin: 0;
  color: var(--gray-800);
  font-size: 16px;
  font-weight: var(--font-weight-medium);
}

.availability__hint {
  margin: 0;
  max-width: 520px;
  color: var(--gray-500);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  background: transparent;
}

.check {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: var(--font-weight-regular);
}

.check input {
  appearance: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 1.5px solid var(--gray-400);
  border-radius: 4px;
  background: var(--white);
  cursor: pointer;
  flex-shrink: 0;
}

.check input:checked {
  border-color: var(--blue-600);
  background-color: var(--blue-600);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.2L6.4 11.1L12.5 4.9' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

.empty {
  margin: 0;
  color: var(--gray-600);
}

@media (max-width: 900px) {
  .block,
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .row input,
  .location,
  .location input {
    max-width: none;
  }

  .location {
    flex-wrap: wrap;
  }
}
</style>
