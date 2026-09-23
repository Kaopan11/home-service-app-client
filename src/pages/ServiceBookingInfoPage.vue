<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingInfoForm from '@/components/booking/BookingInfoForm.vue'
import BookingLayout from '@/components/booking/BookingLayout.vue'
import BookingPayment from '@/components/booking/BookingPayment.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import { formatAddressSummary } from '@/services/userService'
import { useBookingStore, type BookingCustomerInfo } from '@/stores/booking'
import { useProfileStore } from '@/stores/profile'

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
    paymentConfirmed.value = true
    bookingStore.clear()
  }
}
</script>

<template>
  <section v-if="!ready" class="booking-status">
    <p>กำลังโหลดข้อมูลการจอง...</p>
  </section>

  <section v-else-if="paymentConfirmed" class="confirmed">
    <img
      class="confirmed__icon"
      src="/icons/action/check-circle-filled.svg"
      alt=""
      width="64"
      height="64"
    />
    <h1 class="confirmed__title">ชำระเงินสำเร็จ</h1>
    <p class="confirmed__text">
      ขอบคุณที่ใช้บริการ HomeServices ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมาย
    </p>
    <RouterLink class="btn btn--primary" :to="{ name: 'home' }">กลับสู่หน้าหลัก</RouterLink>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 28rem;
  margin: 0 auto;
  padding: 6rem 1.5rem;
  text-align: center;
}

.confirmed__title {
  font-size: var(--headline-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.confirmed__text {
  margin-bottom: 0.75rem;
  color: var(--gray-600);
}
</style>
