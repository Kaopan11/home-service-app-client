<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type CalendarCell = {
  day: number
  current: boolean
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const props = withDefaults(
  defineProps<{
    placeholder?: string
    defaultOpen?: boolean
  }>(),
  {
    placeholder: 'กรุณาเลือกวันที่',
    defaultOpen: false,
  },
)

const selectedDate = defineModel<Date | null>({ default: null })
const open = ref(props.defaultOpen)

const initial = selectedDate.value ?? new Date()
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth())

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  }),
)

const triggerLabel = computed(() => {
  if (!selectedDate.value) return props.placeholder
  return selectedDate.value.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const calendarDays = computed<CalendarCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, current: true })
  }
  let next = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: next, current: false })
    next += 1
  }
  return cells
})

watch(selectedDate, (date) => {
  if (!date) return
  viewYear.value = date.getFullYear()
  viewMonth.value = date.getMonth()
})

function toggle() {
  open.value = !open.value
}

function shiftMonth(delta: number) {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth()
}

function isSelected(cell: CalendarCell) {
  if (!cell.current || !selectedDate.value) return false
  return (
    cell.day === selectedDate.value.getDate() &&
    viewMonth.value === selectedDate.value.getMonth() &&
    viewYear.value === selectedDate.value.getFullYear()
  )
}

function selectDay(cell: CalendarCell) {
  if (!cell.current) return
  selectedDate.value = new Date(viewYear.value, viewMonth.value, cell.day)
  open.value = false
}
</script>

<template>
  <div class="picker" :class="{ 'picker--open': open }">
    <button
      class="input picker__trigger"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggle"
    >
      <span class="dropdown__value" :class="{ 'dropdown__value--placeholder': !selectedDate }">
        {{ triggerLabel }}
      </span>
      <span class="icon icon--calendar" aria-hidden="true"></span>
    </button>
    <div class="picker__panel">
      <div class="calendar">
        <div class="calendar__header">
          <p class="calendar__title">{{ monthLabel }}</p>
          <div class="calendar__nav">
            <button
              class="calendar__nav-btn calendar__nav-btn--prev"
              type="button"
              aria-label="Previous month"
              @click="shiftMonth(-1)"
            >
              <span class="icon icon--chevron"></span>
            </button>
            <button
              class="calendar__nav-btn calendar__nav-btn--next"
              type="button"
              aria-label="Next month"
              @click="shiftMonth(1)"
            >
              <span class="icon icon--chevron"></span>
            </button>
          </div>
        </div>
        <div class="calendar__weekdays">
          <span v-for="(day, index) in weekdays" :key="`${day}-${index}`">{{ day }}</span>
        </div>
        <div class="calendar__days">
          <button
            v-for="(cell, index) in calendarDays"
            :key="`${cell.day}-${index}`"
            class="calendar__day"
            :class="{
              'calendar__day--muted': !cell.current,
              'calendar__day--selected': isSelected(cell),
            }"
            type="button"
            :tabindex="cell.current ? 0 : -1"
            @click="selectDay(cell)"
          >
            {{ cell.day }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
