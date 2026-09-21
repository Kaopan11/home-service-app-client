<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const props = withDefaults(
  defineProps<{
    placeholder?: string
    defaultOpen?: boolean
    hourCycle?: 'h23' | 'h12'
  }>(),
  {
    placeholder: 'กรุณาเลือกเวลา',
    defaultOpen: false,
    hourCycle: 'h23',
  },
)

const selectedTime = defineModel<string | null>({ default: null })
const open = ref(props.defaultOpen)
const hourColumn = useTemplateRef<HTMLElement>('hourColumn')
const minuteColumn = useTemplateRef<HTMLElement>('minuteColumn')

function parseTime(value: string | null) {
  if (!value) return { hour: 5, minute: 0 }
  const [hourPart, minutePart] = value.split(':')
  const hour = Number(hourPart)
  const minute = Number(minutePart)
  return {
    hour: Number.isFinite(hour) ? hour : 5,
    minute: Number.isFinite(minute) ? minute : 0,
  }
}

const parsed = parseTime(selectedTime.value)
const selectedHour = ref(parsed.hour)
const selectedMinute = ref(parsed.minute)

function padTime(value: number) {
  return String(value).padStart(2, '0')
}

const timeValue = computed(
  () => `${padTime(selectedHour.value)}:${padTime(selectedMinute.value)}`,
)

function format12Hour(value: string): string {
  const { hour, minute } = parseTime(value)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${padTime(minute)} ${period}`
}

const triggerLabel = computed(() => {
  if (!selectedTime.value) return props.placeholder
  if (props.hourCycle === 'h12') {
    return format12Hour(selectedTime.value)
  }
  return selectedTime.value
})

function scrollSelectedIntoView() {
  for (const column of [hourColumn.value, minuteColumn.value]) {
    if (!column) continue
    const item = column.querySelector('.timepicker__item--selected')
    if (!(item instanceof HTMLElement)) continue
    column.scrollTop = item.offsetTop - column.clientHeight / 2 + item.clientHeight / 2
  }
}

watch(selectedTime, (value) => {
  const next = parseTime(value)
  selectedHour.value = next.hour
  selectedMinute.value = next.minute
})

watch(open, (isOpen) => {
  if (!isOpen) return
  void nextTick(scrollSelectedIntoView)
})

onMounted(() => {
  if (open.value) void nextTick(scrollSelectedIntoView)
})

function toggle() {
  open.value = !open.value
}

function confirmTime() {
  selectedTime.value = timeValue.value
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
      <span
        class="dropdown__value"
        :class="{ 'dropdown__value--placeholder': !selectedTime }"
      >
        {{ triggerLabel }}
      </span>
      <span class="icon icon--clock" aria-hidden="true"></span>
    </button>
    <div class="picker__panel timepicker__panel">
      <div class="timepicker__columns">
        <div
          ref="hourColumn"
          class="timepicker__column"
          role="listbox"
          aria-label="Hours"
        >
          <button
            v-for="hour in hours"
            :key="`h-${hour}`"
            class="timepicker__item"
            :class="{ 'timepicker__item--selected': hour === selectedHour }"
            type="button"
            role="option"
            @click="selectedHour = hour"
          >
            {{ padTime(hour) }}
          </button>
        </div>
        <div
          ref="minuteColumn"
          class="timepicker__column"
          role="listbox"
          aria-label="Minutes"
        >
          <button
            v-for="minute in minutes"
            :key="`m-${minute}`"
            class="timepicker__item"
            :class="{ 'timepicker__item--selected': minute === selectedMinute }"
            type="button"
            role="option"
            @click="selectedMinute = minute"
          >
            {{ padTime(minute) }}
          </button>
        </div>
      </div>
      <div class="timepicker__footer">
        <span class="timepicker__value">{{ timeValue }}</span>
        <button class="timepicker__confirm" type="button" @click="confirmTime">ยืนยัน</button>
      </div>
    </div>
  </div>
</template>
