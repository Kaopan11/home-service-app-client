<script setup lang="ts">
import { computed } from 'vue'
import { formatBaht } from '@/data/serviceDetails'
import type { SelectedBookingItem } from '@/composables/useBooking'

const props = defineProps<{
  items: SelectedBookingItem[]
  totalPrice: number
  scheduledDate?: string
  scheduledTime?: string
  address?: string
}>()

const hasAppointment = computed(() =>
  Boolean(props.scheduledDate || props.scheduledTime || props.address),
)
</script>

<template>
  <aside class="summary">
    <div class="summary__header">
      <h2 class="summary__title">สรุปรายการ</h2>
      <span v-if="items.length > 0" class="summary__info" aria-hidden="true">i</span>
    </div>

    <ul v-if="items.length > 0" class="summary__list">
      <li v-for="item in items" :key="item.id" class="summary__row">
        <span class="summary__name">{{ item.name }}</span>
        <span class="summary__qty">{{ item.quantity }} รายการ</span>
      </li>
    </ul>

    <dl v-if="hasAppointment" class="summary__meta">
      <div v-if="scheduledDate" class="summary__row">
        <dt>วันที่</dt>
        <dd>{{ scheduledDate }}</dd>
      </div>
      <div v-if="scheduledTime" class="summary__row">
        <dt>เวลา</dt>
        <dd>{{ scheduledTime }}</dd>
      </div>
      <div v-if="address" class="summary__row">
        <dt>ที่อยู่</dt>
        <dd class="summary__address">{{ address }}</dd>
      </div>
    </dl>

    <div class="summary__total" :class="{ 'is-empty': items.length === 0 && !hasAppointment }">
      <span>รวม</span>
      <strong :class="{ 'summary__amount--active': items.length > 0 }">
        {{ formatBaht(totalPrice) }}
      </strong>
    </div>
  </aside>
</template>

<style scoped>
.summary {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  height: fit-content;
}

.summary__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.summary__title {
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.summary__info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--blue-600);
  color: var(--white);
  font-size: 0.75rem;
  font-weight: var(--font-weight-semibold);
  font-style: italic;
  line-height: 1;
}

.summary__list {
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: var(--body-3-size);
  color: var(--gray-700);
}

.summary__name {
  min-width: 0;
}

.summary__qty {
  flex-shrink: 0;
  white-space: nowrap;
}

.summary__meta {
  margin: 0 0 1rem;
}

.summary__meta .summary__row {
  margin-bottom: 0.5rem;
}

.summary__meta dt {
  flex-shrink: 0;
}

.summary__meta dd {
  margin: 0;
  text-align: right;
}

.summary__address {
  max-width: 12rem;
}

.summary__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-300);
  font-size: var(--body-3-size);
  color: var(--gray-700);
}

.summary__total.is-empty {
  padding-top: 0;
  border-top: none;
}

.summary__total strong {
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
}

.summary__amount--active {
  color: var(--blue-600);
}

@media (max-width: 768px) {
  .summary {
    padding: 1rem;
  }
}
</style>
