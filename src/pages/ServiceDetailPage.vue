<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BookingOptionList from '@/components/booking/BookingOptionList.vue'
import BookingStepper from '@/components/booking/BookingStepper.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useBooking } from '@/composables/useBooking'
import { getServiceDetail } from '@/data/serviceDetails'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())

const currentStep = ref(1)
const detail = computed(() => getServiceDetail(String(route.params.id)))
const options = computed(() => detail.value?.options ?? [])

const { quantities, increment, decrement, selectedItems, totalPrice, canContinue } =
  useBooking(options)

watch(
  () => route.params.id,
  () => {
    currentStep.value = 1
  },
)

const nextLabel = computed(() => (currentStep.value >= 3 ? 'ยืนยันการชำระเงิน' : 'ดำเนินการต่อ'))

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value -= 1
    return
  }
  void router.push({ name: 'service' })
}

function goNext() {
  if (!canContinue.value || currentStep.value >= 3) return
  currentStep.value += 1
}
</script>

<template>
  <div class="booking">
    <TheHeader :guest="!isAuthenticated" />

    <template v-if="detail">
      <section class="hero" :style="{ backgroundImage: `url(${detail.image})` }">
        <div class="hero__inner">
          <nav class="hero__crumb" aria-label="breadcrumb">
            <RouterLink class="hero__crumb-link" :to="{ name: 'service' }">บริการของเรา</RouterLink>
            <span class="hero__crumb-sep" aria-hidden="true">›</span>
            <span class="hero__crumb-current">{{ detail.title }}</span>
          </nav>
        </div>
      </section>

      <section class="booking__stepper">
        <BookingStepper :current-step="currentStep" />
      </section>

      <div class="booking__body">
        <div class="booking__grid">
          <BookingOptionList
            v-if="currentStep === 1"
            :title="`เลือกรายการบริการ${detail.title}`"
            :options="detail.options"
            :quantities="quantities"
            @increment="increment"
            @decrement="decrement"
          />
          <section v-else class="placeholder">
            <h2>{{ currentStep === 2 ? 'กรอกข้อมูลบริการ' : 'ชำระเงิน' }}</h2>
            <p>ขั้นตอนนี้จะพร้อมใช้งานในรอบถัดไป</p>
          </section>
          <BookingSummary :items="selectedItems" :total-price="totalPrice" />
        </div>
      </div>

      <div class="booking__nav">
        <div class="booking__nav-inner">
          <button class="btn btn--secondary" type="button" @click="goBack">
            <span aria-hidden="true">‹</span>
            ย้อนกลับ
          </button>
          <button
            class="btn btn--primary"
            type="button"
            :disabled="!canContinue || currentStep >= 3"
            @click="goNext"
          >
            {{ nextLabel }}
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </template>

    <section v-else class="booking__missing">
      <p>ไม่พบบริการนี้</p>
      <RouterLink class="btn btn--secondary" :to="{ name: 'service' }">กลับไปหน้ารายการ</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.booking {
  min-height: 100svh;
  background: var(--bg);
  padding-bottom: 6rem;
}

.hero {
  position: relative;
  height: 15.5rem;
  background-size: cover;
  background-position: center;
}

.hero__inner {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero__crumb {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--white);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  color: var(--blue-800);
}

.hero__crumb-link {
  color: var(--blue-800);
  text-decoration: none;
  font-size: var(--body-3-size);
}

.hero__crumb-link:hover {
  text-decoration: underline;
}

.hero__crumb-sep {
  color: var(--blue-700);
}

.hero__crumb-current {
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--blue-800);
}

.booking__stepper {
  background: var(--white);
}

.booking__body {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
}

.booking__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(17.5rem, 22rem);
  align-items: start;
  gap: 1.5rem;
}

.placeholder {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.placeholder h2 {
  margin-bottom: 0.5rem;
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.placeholder p {
  margin: 0;
  color: var(--gray-600);
}

.booking__nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  background: var(--white);
  box-shadow: 0 -2px 16px rgba(23, 51, 106, 0.1);
}

.booking__nav-inner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.booking__missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 6rem 1.5rem;
  color: var(--gray-700);
}

@media (max-width: 900px) {
  .hero {
    height: 11rem;
  }

  .hero__inner {
    padding: 0 1rem;
  }

  .hero__crumb {
    padding: 0.625rem 1rem;
  }

  .booking__body {
    padding: 1rem 1rem 1.5rem;
  }

  .booking__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
