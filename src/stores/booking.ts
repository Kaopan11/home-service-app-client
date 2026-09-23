import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { SelectedBookingItem } from '@/composables/useBooking'

export type BookingCustomerInfo = {
  date: string | null
  time: string | null
  address: string
  subdistrict: string
  district: string
  province: string
  note: string
}

export type BookingDraft = {
  serviceId: string
  serviceTitle: string
  serviceImage: string
  items: SelectedBookingItem[]
  totalPrice: number
  customer: BookingCustomerInfo
}

const STORAGE_KEY = 'home_services_booking_draft'

const EMPTY_CUSTOMER: BookingCustomerInfo = {
  date: null,
  time: null,
  address: '',
  subdistrict: '',
  district: '',
  province: '',
  note: '',
}

function readDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BookingDraft
  } catch {
    return null
  }
}

function writeDraft(draft: BookingDraft | null): void {
  if (!draft) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function createEmptyCustomer(): BookingCustomerInfo {
  return { ...EMPTY_CUSTOMER }
}

export const useBookingStore = defineStore('booking', () => {
  const draft = ref<BookingDraft | null>(readDraft())

  const hasSelection = computed(() => Boolean(draft.value && draft.value.items.length > 0))

  function persist(): void {
    writeDraft(draft.value)
  }

  function setSelection(payload: {
    serviceId: string
    serviceTitle: string
    serviceImage: string
    items: SelectedBookingItem[]
    totalPrice: number
  }): void {
    const keepCustomer =
      draft.value?.serviceId === payload.serviceId ? draft.value.customer : createEmptyCustomer()

    draft.value = {
      ...payload,
      items: payload.items.map((item) => ({ ...item })),
      customer: { ...keepCustomer },
    }
    persist()
  }

  function updateCustomer(partial: Partial<BookingCustomerInfo>): void {
    if (!draft.value) return
    draft.value = {
      ...draft.value,
      customer: { ...draft.value.customer, ...partial },
    }
    persist()
  }

  function matchesService(serviceId: string): boolean {
    return draft.value?.serviceId === serviceId && (draft.value?.items.length ?? 0) > 0
  }

  function clear(): void {
    draft.value = null
    persist()
  }

  return {
    draft,
    hasSelection,
    setSelection,
    updateCustomer,
    matchesService,
    clear,
  }
})
