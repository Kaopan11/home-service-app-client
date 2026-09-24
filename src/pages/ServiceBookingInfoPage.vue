<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingInfoForm from '@/components/booking/BookingInfoForm.vue'
import BookingLayout from '@/components/booking/BookingLayout.vue'
import BookingPayment from '@/components/booking/BookingPayment.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { formatAddressSummary } from '@/services/userService'
import { formatBaht } from '@/data/serviceDetails'
import { useBookingStore, type BookingCustomerInfo } from '@/stores/booking'
import { useProfileStore } from '@/stores/profile'
import type { SelectedBookingItem } from '@/composables/useBooking'

type PaymentReceipt = {
  items: SelectedBookingItem[]
  totalPrice: number
  date: string
  time: string
  address: string
}

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const profileStore = useProfileStore()

const serviceId = computed(() => String(route.params.id))
const ready = ref(false)
const step = ref<2 | 3>(2)

const paymentMethod = ref<'promptpay' | 'card'>('card')
const paymentValid = ref(false)
const paymentConfirmed = ref(false)
const receipt = ref<PaymentReceipt | null>(null)
const paymentRef = ref<InstanceType<typeof BookingPayment> | null>(null)
const submittingPayment = computed(() => paymentRef.value?.submitting ?? false)

const customer = ref<BookingCustomerInfo>({
  date: null,
  time: null,
  address: '',
  subdistrict: '',
  district: '',
  province: '',
  note: '',
})

const errors = reactive({
  date: '',
  time: '',
  address: '',
  subdistrict: '',
  district: '',
  province: '',
})

const draft = computed(() => bookingStore.draft)

const formattedDate = computed(() => {
  if (!customer.value.date) return ''
  const date = new Date(`${customer.value.date}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    calendar: 'gregory',
  }).format(date)
})

const formattedTime = computed(() => (customer.value.time ? `${customer.value.time} น.` : ''))

const formattedAddress = computed(() =>
  formatAddressSummary({
    address: customer.value.address,
    subdistrict: customer.value.subdistrict,
    district: customer.value.district,
    province: customer.value.province,
  }),
)

const infoComplete = computed(
  () =>
    Boolean(customer.value.date) &&
    Boolean(customer.value.time) &&
    Boolean(customer.value.address.trim()) &&
    Boolean(customer.value.province) &&
    Boolean(customer.value.district) &&
    Boolean(customer.value.subdistrict),
)

const canContinue = computed(() =>
  step.value === 3 ? paymentValid.value && !submittingPayment.value : infoComplete.value,
)

const nextLabel = computed(() => {
  if (step.value === 2) return 'ดำเนินการต่อ'
  return submittingPayment.value ? 'กำลังชำระเงิน...' : 'ยืนยันการชำระเงิน'
})

function applyDraft(): boolean {
  if (!bookingStore.matchesService(serviceId.value) || !bookingStore.draft) {
    return false
  }
  customer.value = { ...bookingStore.draft.customer }
  return true
}

function prefillFromProfile(): void {
  const address = profileStore.address
  if (!customer.value.address && address.address) customer.value.address = address.address
  if (!customer.value.province && address.province) customer.value.province = address.province
  if (!customer.value.district && address.district) customer.value.district = address.district
  if (!customer.value.subdistrict && address.subdistrict) {
    customer.value.subdistrict = address.subdistrict
  }
}

function clearError(field: keyof typeof errors): void {
  errors[field] = ''
}

function validate(): boolean {
  errors.date = customer.value.date ? '' : 'กรุณาเลือกวันที่'
  errors.time = customer.value.time ? '' : 'กรุณาเลือกเวลา'
  errors.address = customer.value.address.trim() ? '' : 'กรุณากรอกที่อยู่'
  errors.province = customer.value.province ? '' : 'กรุณาเลือกจังหวัด'
  errors.district = customer.value.district ? '' : 'กรุณาเลือกเขต / อำเภอ'
  errors.subdistrict = customer.value.subdistrict ? '' : 'กรุณาเลือกแขวง / ตำบล'
  return !Object.values(errors).some(Boolean)
}

watch(
  customer,
  (value) => {
    bookingStore.updateCustomer(value)
  },
  { deep: true },
)

onMounted(async () => {
  if (!applyDraft()) {
    await router.replace({ name: 'service-detail', params: { id: serviceId.value } })
    return
  }
  await profileStore.loadProfile()
  prefillFromProfile()
  ready.value = true
})

function goBack(): void {
  if (step.value === 3) {
    step.value = 2
    return
  }
  void router.push({ name: 'service-detail', params: { id: serviceId.value } })
}

async function goNext(): Promise<void> {
  if (step.value === 2) {
    if (!validate()) return
    bookingStore.updateCustomer(customer.value)
    step.value = 3
    return
  }
  if (!canContinue.value) return
  const ok = await paymentRef.value?.submit()
  if (ok) {
    receipt.value = {
      items: draft.value?.items ?? [],
      totalPrice: draft.value?.totalPrice ?? 0,
      date: formattedDate.value,
      time: formattedTime.value,
      address: formattedAddress.value,
    }
    paymentConfirmed.value = true
    bookingStore.clear()
  }
}
</script>

<template>
  <section v-if="!ready" class="booking-status">
    <p>กำลังโหลดข้อมูลการจอง...</p>
  </section>

  <section v-else-if="paymentConfirmed && receipt" class="confirmed">
    <TheHeader />
    <div class="confirmed__card">
      <svg class="confirmed__icon" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="var(--green-900)" />
        <path
          d="M20 33L28 41L44 24"
          fill="none"
          stroke="var(--white)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <h1 class="confirmed__title">ชำระเงินเรียบร้อย !</h1>

      <ul class="confirmed__items">
        <li v-for="item in receipt.items" :key="item.id" class="confirmed__row">
          <span class="confirmed__name">{{ item.name }}</span>
          <span class="confirmed__qty">{{ item.quantity }} รายการ</span>
        </li>
      </ul>

      <div class="confirmed__divider" role="separator"></div>

      <dl class="confirmed__meta">
        <div class="confirmed__row">
          <dt>วันที่</dt>
          <dd>{{ receipt.date }}</dd>
        </div>
        <div class="confirmed__row">
          <dt>เวลา</dt>
          <dd>{{ receipt.time }}</dd>
        </div>
        <div class="confirmed__row">
          <dt>สถานที่</dt>
          <dd class="confirmed__address">{{ receipt.address }}</dd>
        </div>
      </dl>

      <div class="confirmed__divider" role="separator"></div>

      <div class="confirmed__total">
        <span>รวม</span>
        <strong>{{ formatBaht(receipt.totalPrice) }}</strong>
      </div>

      <RouterLink class="btn btn--primary confirmed__cta" :to="{ name: 'user-orders' }">
        เช็ครายการซ่อม
      </RouterLink>
    </div>
  </section>

  <BookingLayout
    v-else-if="draft"
    :image="draft.serviceImage"
    :title="draft.serviceTitle"
    :current-step="step"
  >
    <BookingInfoForm
      v-if="step === 2"
      v-model="customer"
      :errors="errors"
      @clear-error="clearError"
    />
    <BookingPayment
      v-else
      ref="paymentRef"
      v-model:method="paymentMethod"
      v-model:valid="paymentValid"
      :total-price="draft.totalPrice"
    />

    <template #summary>
      <BookingSummary
        :items="draft.items"
        :total-price="draft.totalPrice"
        :scheduled-date="formattedDate"
        :scheduled-time="formattedTime"
        :address="formattedAddress"
      />
    </template>

    <template #nav>
      <button class="btn btn--secondary" type="button" @click="goBack">
        <span aria-hidden="true">‹</span>
        ย้อนกลับ
      </button>
      <button class="btn btn--primary" type="button" :disabled="!canContinue" @click="goNext">
        {{ nextLabel }}
        <span aria-hidden="true">›</span>
      </button>
    </template>
  </BookingLayout>
</template>

<style scoped>
.booking-status {
  display: flex;
  justify-content: center;
  min-height: 100svh;
  padding: 6rem 1.5rem;
  background: var(--bg);
  color: var(--gray-700);
}

.confirmed {
  min-height: 100svh;
  background: var(--bg);
}

.confirmed__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 28rem;
  margin: 3rem auto 0;
  padding: 2.5rem 2rem;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.confirmed__icon {
  margin-bottom: 0.5rem;
}

.confirmed__title {
  margin-bottom: 1rem;
  font-size: var(--headline-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.confirmed__items {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.confirmed__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.625rem;
  font-size: var(--body-3-size);
  color: var(--gray-700);
}

.confirmed__row:last-child {
  margin-bottom: 0;
}

.confirmed__meta {
  width: 100%;
  margin: 0;
}

.confirmed__meta dt {
  color: var(--gray-600);
}

.confirmed__meta dd {
  margin: 0;
  text-align: right;
}

.confirmed__address {
  max-width: 14rem;
}

.confirmed__divider {
  width: 100%;
  height: 1px;
  margin: 1rem 0;
  background: var(--gray-300);
}

.confirmed__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.confirmed__total strong {
  font-size: var(--headline-4-size);
}

.confirmed__cta {
  width: 100%;
}
</style>
