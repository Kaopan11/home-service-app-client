<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingInfoForm from '@/components/booking/BookingInfoForm.vue'
import BookingLayout from '@/components/booking/BookingLayout.vue'
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
const paymentNotice = ref('')

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

const canContinue = computed(
  () =>
    Boolean(customer.value.date) &&
    Boolean(customer.value.time) &&
    Boolean(customer.value.address.trim()) &&
    Boolean(customer.value.province) &&
    Boolean(customer.value.district) &&
    Boolean(customer.value.subdistrict),
)

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
  void router.push({ name: 'service-detail', params: { id: serviceId.value } })
}

function goNext(): void {
  paymentNotice.value = ''
  if (!validate()) return
  bookingStore.updateCustomer(customer.value)
  paymentNotice.value = 'ขั้นตอนชำระเงินจะพร้อมใช้งานในรอบถัดไป'
}
</script>

<template>
  <section v-if="!ready" class="booking-status">
    <p>กำลังโหลดข้อมูลการจอง...</p>
  </section>

  <BookingLayout
    v-else-if="draft"
    :image="draft.serviceImage"
    :title="draft.serviceTitle"
    :current-step="2"
  >
    <BookingInfoForm v-model="customer" :errors="errors" @clear-error="clearError" />

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
      <div class="booking-next">
        <p v-if="paymentNotice" class="booking-next__hint">{{ paymentNotice }}</p>
        <button class="btn btn--primary" type="button" :disabled="!canContinue" @click="goNext">
          ดำเนินการต่อ
          <span aria-hidden="true">›</span>
        </button>
      </div>
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

.booking-next {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.booking-next__hint {
  margin: 0;
  max-width: 16rem;
  text-align: right;
  font-size: var(--body-3-size);
  color: var(--gray-600);
}
</style>
