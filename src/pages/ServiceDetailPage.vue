<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BookingLayout from '@/components/booking/BookingLayout.vue'
import BookingOptionList from '@/components/booking/BookingOptionList.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useBooking } from '@/composables/useBooking'
import type { ServiceDetail } from '@/data/serviceDetails'
import { getServiceById, type ServiceDetailDto } from '@/services/services'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())
const bookingStore = useBookingStore()

const detail = ref<ServiceDetail | null>(null)
const loading = ref(true)
const options = computed(() => detail.value?.options ?? [])
const serviceId = computed(() => String(route.params.id))

const { quantities, increment, decrement, selectedItems, totalPrice, canContinue } =
  useBooking(options)

function mapDetail(item: ServiceDetailDto): ServiceDetail {
  const fallbackImage =
    'https://images.unsplash.com/photo-1556912173-46e0d4d0a0a2?auto=format&fit=crop&w=1440&q=80'
  return {
    serviceId: String(item.id),
    title: item.name,
    category: item.categoryName,
    image: item.image || fallbackImage,
    options: (item.options ?? []).map((option) => ({
      id: String(option.id),
      name: option.name,
      unit: option.unit || 'ชิ้น',
      price: Number(option.price),
    })),
  }
}

async function loadDetail(id: string): Promise<void> {
  loading.value = true
  try {
    const response = await getServiceById(id)
    if (response?.data) {
      detail.value = mapDetail(response.data)
      return
    }
    detail.value = null
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}

function restoreQuantities(): void {
  if (!bookingStore.matchesService(serviceId.value) || !bookingStore.draft) return
  for (const item of bookingStore.draft.items) {
    quantities[item.id] = item.quantity
  }
}

onMounted(async () => {
  await loadDetail(serviceId.value)
  restoreQuantities()
})

watch(serviceId, async (id) => {
  await loadDetail(id)
  restoreQuantities()
})

function goBack() {
  void router.push({ name: 'service' })
}

function saveSelection(): void {
  if (!detail.value) return
  bookingStore.setSelection({
    serviceId: serviceId.value,
    serviceTitle: detail.value.title,
    serviceImage: detail.value.image,
    items: selectedItems.value,
    totalPrice: totalPrice.value,
  })
}

function goNext() {
  if (!canContinue.value || !detail.value) return
  saveSelection()
  const infoLocation = {
    name: 'service-booking-info',
    params: { id: serviceId.value },
  }
  if (!isAuthenticated.value) {
    const redirect = router.resolve(infoLocation).fullPath
    void router.push({ name: 'login', query: { redirect } })
    return
  }
  void router.push(infoLocation)
}
</script>

<template>
  <div v-if="loading" class="booking-status">
    <TheHeader :guest="!isAuthenticated" />
    <p>กำลังโหลดบริการ...</p>
  </div>

  <BookingLayout
    v-else-if="detail"
    :image="detail.image"
    :title="detail.title"
    :current-step="1"
  >
    <BookingOptionList
      :title="`เลือกรายการบริการ${detail.title}`"
      :options="detail.options"
      :quantities="quantities"
      @increment="increment"
      @decrement="decrement"
    />

    <template #summary>
      <BookingSummary :items="selectedItems" :total-price="totalPrice" />
    </template>

    <template #nav>
      <button class="btn btn--secondary" type="button" @click="goBack">
        <span aria-hidden="true">‹</span>
        ย้อนกลับ
      </button>
      <button class="btn btn--primary" type="button" :disabled="!canContinue" @click="goNext">
        ดำเนินการต่อ
        <span aria-hidden="true">›</span>
      </button>
    </template>
  </BookingLayout>

  <section v-else class="booking-status">
    <TheHeader :guest="!isAuthenticated" />
    <p>ไม่พบบริการนี้</p>
    <RouterLink class="btn btn--secondary" :to="{ name: 'service' }">กลับไปหน้ารายการ</RouterLink>
  </section>
</template>

<style scoped>
.booking-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 100svh;
  padding: 6rem 1.5rem;
  background: var(--bg);
  color: var(--gray-700);
}
</style>
