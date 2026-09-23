<script setup lang="ts">
import { computed, watch } from 'vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import TimePicker from '@/components/ui/TimePicker.vue'
import SelectDropdown from '@/components/ui/SelectDropdown.vue'
import { getDistricts, getProvinces, getSubdistricts } from '@/data/thaiAddress'
import type { BookingCustomerInfo } from '@/stores/booking'

const customer = defineModel<BookingCustomerInfo>({ required: true })

const props = defineProps<{
  errors: {
    date: string
    time: string
    address: string
    subdistrict: string
    district: string
    province: string
  }
}>()

const emit = defineEmits<{
  clearError: [field: keyof typeof props.errors]
}>()

const selectedDate = computed<Date | null>({
  get() {
    if (!customer.value.date) return null
    const next = new Date(`${customer.value.date}T00:00:00`)
    return Number.isNaN(next.getTime()) ? null : next
  },
  set(value) {
    customer.value = {
      ...customer.value,
      date: value
        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
        : null,
    }
    emit('clearError', 'date')
  },
})

const selectedTime = computed<string | null>({
  get() {
    return customer.value.time
  },
  set(value) {
    customer.value = { ...customer.value, time: value }
    emit('clearError', 'time')
  },
})

const provinces = computed(() => getProvinces())
const districts = computed(() => (customer.value.province ? getDistricts(customer.value.province) : []))
const subdistricts = computed(() =>
  customer.value.province && customer.value.district
    ? getSubdistricts(customer.value.province, customer.value.district)
    : [],
)

function onProvinceChange(province: string) {
  const availableDistricts = getDistricts(province)
  const district = availableDistricts.includes(customer.value.district) ? customer.value.district : ''
  const availableSubdistricts = district ? getSubdistricts(province, district) : []
  const subdistrict = availableSubdistricts.includes(customer.value.subdistrict)
    ? customer.value.subdistrict
    : ''
  customer.value = { ...customer.value, province, district, subdistrict }
  emit('clearError', 'province')
  if (!district) emit('clearError', 'district')
  if (!subdistrict) emit('clearError', 'subdistrict')
}

function onDistrictChange(district: string) {
  const availableSubdistricts = getSubdistricts(customer.value.province, district)
  const subdistrict = availableSubdistricts.includes(customer.value.subdistrict)
    ? customer.value.subdistrict
    : ''
  customer.value = { ...customer.value, district, subdistrict }
  emit('clearError', 'district')
  if (!subdistrict) emit('clearError', 'subdistrict')
}

function onSubdistrictChange(subdistrict: string) {
  customer.value = { ...customer.value, subdistrict }
  emit('clearError', 'subdistrict')
}

watch(
  () => customer.value.address,
  () => emit('clearError', 'address'),
)
</script>

<template>
  <section class="info-form">
    <h2 class="info-form__title">กรอกข้อมูลบริการ</h2>

    <div class="info-form__grid">
      <div class="field">
        <label class="field__label">
          วันที่สะดวกใช้บริการ<span class="required" aria-hidden="true">*</span>
        </label>
        <DatePicker v-model="selectedDate" placeholder="กรุณาเลือกวันที่" />
        <p v-if="errors.date" class="field__error">{{ errors.date }}</p>
      </div>

      <div class="field">
        <label class="field__label">
          เวลาที่สะดวกใช้บริการ<span class="required" aria-hidden="true">*</span>
        </label>
        <TimePicker v-model="selectedTime" placeholder="กรุณาเลือกเวลา" />
        <p v-if="errors.time" class="field__error">{{ errors.time }}</p>
      </div>

      <div class="field">
        <label class="field__label" for="booking-address">
          ที่อยู่<span class="required" aria-hidden="true">*</span>
        </label>
        <input
          id="booking-address"
          v-model="customer.address"
          class="field__input"
          :class="{ 'field__input--error': errors.address }"
          type="text"
          placeholder="กรุณากรอกที่อยู่"
        />
        <p v-if="errors.address" class="field__error">{{ errors.address }}</p>
      </div>

      <div class="field">
        <label class="field__label">
          แขวง / ตำบล<span class="required" aria-hidden="true">*</span>
        </label>
        <SelectDropdown
          :model-value="customer.subdistrict"
          :options="subdistricts"
          :disabled="!customer.district"
          :has-error="Boolean(errors.subdistrict)"
          placeholder="เลือกแขวง / ตำบล"
          @update:model-value="onSubdistrictChange"
        />
        <p v-if="errors.subdistrict" class="field__error">{{ errors.subdistrict }}</p>
      </div>

      <div class="field">
        <label class="field__label">
          เขต / อำเภอ<span class="required" aria-hidden="true">*</span>
        </label>
        <SelectDropdown
          :model-value="customer.district"
          :options="districts"
          :disabled="!customer.province"
          :has-error="Boolean(errors.district)"
          placeholder="เลือกเขต / อำเภอ"
          @update:model-value="onDistrictChange"
        />
        <p v-if="errors.district" class="field__error">{{ errors.district }}</p>
      </div>

      <div class="field">
        <label class="field__label">
          จังหวัด<span class="required" aria-hidden="true">*</span>
        </label>
        <SelectDropdown
          :model-value="customer.province"
          :options="provinces"
          :has-error="Boolean(errors.province)"
          placeholder="เลือกจังหวัด"
          @update:model-value="onProvinceChange"
        />
        <p v-if="errors.province" class="field__error">{{ errors.province }}</p>
      </div>

      <div class="field field--full">
        <label class="field__label" for="booking-note">ระบุข้อมูลเพิ่มเติม</label>
        <textarea
          id="booking-note"
          v-model="customer.note"
          class="field__textarea"
          rows="4"
          placeholder="กรุณาระบุข้อมูลเพิ่มเติม"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-form {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.info-form__title {
  margin: 0 0 1.25rem;
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.info-form__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.25rem 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.field--full {
  grid-column: 1 / -1;
}

.field__label {
  font-size: var(--body-3-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-900);
}

.required {
  color: var(--red);
  margin-left: 0.15rem;
}

.field__input,
.field__textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  background: var(--white);
  font: inherit;
  font-size: 1rem;
  color: var(--gray-900);
  outline: none;
}

.field__input {
  height: 2.75rem;
}

.field__textarea {
  min-height: 6.5rem;
  resize: vertical;
}

.field__input::placeholder,
.field__textarea::placeholder {
  color: var(--gray-400);
}

.field__input:focus,
.field__textarea:focus {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 1px var(--blue-600);
}

.field__input--error {
  border-color: var(--red);
}

.field__error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--red);
}

.info-form :deep(.picker__trigger),
.info-form :deep(.select-dropdown__trigger) {
  height: 2.75rem;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .info-form {
    padding: 1rem;
  }

  .info-form__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
