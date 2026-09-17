<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface OptionItem {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: (string | OptionItem)[]
    placeholder?: string
    disabled?: boolean
    hasError?: boolean
    searchable?: boolean
  }>(),
  {
    placeholder: 'เลือกรายการ',
    disabled: false,
    hasError: false,
    searchable: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const rootRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const normalizedOptions = computed<OptionItem[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt }
    }
    return opt
  })
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return normalizedOptions.value
  }
  const q = searchQuery.value.trim().toLowerCase()
  return normalizedOptions.value.filter((opt) => opt.label.toLowerCase().includes(q))
})

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find((opt) => opt.value === props.modelValue)
  return found ? found.label : ''
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    if (props.searchable) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
}

function selectOption(val: string) {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

watch(
  () => props.disabled,
  (newVal) => {
    if (newVal) isOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="rootRef"
    class="select-dropdown"
    :class="{
      'select-dropdown--open': isOpen,
      'select-dropdown--disabled': disabled,
      'select-dropdown--error': hasError,
    }"
  >
    <button
      type="button"
      class="select-dropdown__trigger"
      :disabled="disabled"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
    >
      <span v-if="selectedLabel" class="select-dropdown__value">{{ selectedLabel }}</span>
      <span v-else class="select-dropdown__placeholder">{{ placeholder }}</span>
      <svg
        class="select-dropdown__arrow"
        :class="{ 'select-dropdown__arrow--rotated': isOpen }"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <div v-if="isOpen" class="select-dropdown__menu">
      <div v-if="searchable && normalizedOptions.length > 5" class="select-dropdown__search-wrap">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="select-dropdown__search"
          type="text"
          placeholder="ค้นหา..."
          @click.stop
        />
      </div>

      <ul class="select-dropdown__list" role="listbox">
        <li
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="select-dropdown__item"
          :class="{ 'select-dropdown__item--selected': opt.value === modelValue }"
          @click.stop="selectOption(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <svg
            v-if="opt.value === modelValue"
            class="select-dropdown__check"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </li>
        <li v-if="filteredOptions.length === 0" class="select-dropdown__empty">
          ไม่พบข้อมูล
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.select-dropdown {
  position: relative;
  width: 100%;
}

.select-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 400;
  color: var(--gray-900);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  text-align: left;
}

.select-dropdown__trigger:hover:not(:disabled) {
  border-color: var(--gray-400);
}

.select-dropdown--open .select-dropdown__trigger,
.select-dropdown__trigger:focus {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 1px var(--blue-600);
}

.select-dropdown--error .select-dropdown__trigger {
  border-color: var(--red);
}

.select-dropdown--disabled .select-dropdown__trigger {
  background: var(--gray-100);
  color: var(--gray-400);
  border-color: var(--gray-200);
  cursor: not-allowed;
}

.select-dropdown__placeholder {
  color: var(--gray-400);
}

.select-dropdown__value {
  color: var(--gray-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-dropdown__arrow {
  color: var(--gray-500);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.select-dropdown__arrow--rotated {
  transform: rotate(180deg);
}

.select-dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  max-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeInDown 0.15s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-dropdown__search-wrap {
  padding: 8px 10px;
  border-bottom: 1px solid var(--gray-100);
}

.select-dropdown__search {
  width: 100%;
  height: 34px;
  padding: 6px 10px;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  font-family: var(--font-family);
  font-size: 0.875rem;
  outline: none;
}

.select-dropdown__search:focus {
  border-color: var(--blue-600);
}

.select-dropdown__list {
  list-style: none;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  max-height: 180px;
}

.select-dropdown__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9375rem;
  color: var(--gray-800);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.select-dropdown__item:hover {
  background: var(--gray-100);
  color: var(--blue-600);
}

.select-dropdown__item--selected {
  background: var(--blue-100);
  color: var(--blue-600);
  font-weight: 500;
}

.select-dropdown__check {
  color: var(--blue-600);
  flex-shrink: 0;
}

.select-dropdown__empty {
  padding: 12px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--gray-500);
}
</style>
