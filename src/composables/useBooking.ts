import { computed, reactive, watch, type MaybeRefOrGetter, toValue } from 'vue'
import type { ServiceOption } from '@/data/serviceDetails'

export type SelectedBookingItem = {
  id: string
  name: string
  quantity: number
  price: number
}

export function useBooking(options: MaybeRefOrGetter<ServiceOption[]>) {
  const quantities = reactive<Record<string, number>>({})

  watch(
    () => toValue(options).map((option) => option.id),
    (ids) => {
      const keep = new Set(ids)
      for (const key of Object.keys(quantities)) {
        if (!keep.has(key)) delete quantities[key]
      }
      for (const id of ids) {
        if (quantities[id] == null) quantities[id] = 0
      }
    },
    { immediate: true },
  )

  function increment(id: string) {
    quantities[id] = (quantities[id] ?? 0) + 1
  }

  function decrement(id: string) {
    const current = quantities[id] ?? 0
    if (current > 0) quantities[id] = current - 1
  }

  const selectedItems = computed<SelectedBookingItem[]>(() =>
    toValue(options)
      .map((option) => ({
        id: option.id,
        name: option.name,
        quantity: quantities[option.id] ?? 0,
        price: option.price,
      }))
      .filter((item) => item.quantity > 0),
  )

  const totalQuantity = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const totalPrice = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0),
  )

  const canContinue = computed(() => totalQuantity.value > 0)

  return {
    quantities,
    increment,
    decrement,
    selectedItems,
    totalQuantity,
    totalPrice,
    canContinue,
  }
}
