<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type FilterKey = 'category' | 'price' | 'sort'

const PRICE_CEILING = 3000

const query = defineModel<string>('query', { default: '' })
const category = defineModel<string>('category', { default: 'all' })
const priceMin = defineModel<number>('priceMin', { default: 0 })
const priceMax = defineModel<number>('priceMax', { default: 2000 })
const sort = defineModel<string>('sort', { default: 'name-asc' })

const emit = defineEmits<{
  search: []
}>()

const openKey = ref<FilterKey | null>(null)
const root = ref<HTMLElement | null>(null)

const categoryOptions = [
  { label: 'บริการทั้งหมด', value: 'all' },
  { label: 'บริการทั่วไป', value: 'บริการด้านทั่วไป' },
  { label: 'บริการห้องครัว', value: 'บริการด้านห้องครัว' },
  { label: 'บริการห้องน้ำ', value: 'บริการด้านห้องน้ำ' },
]

const sortOptions = [
  { label: 'บริการแนะนำ', value: 'recommended' },
  { label: 'บริการยอดนิยม', value: 'popular' },
  { label: 'ตามตัวอักษร (Ascending)', value: 'name-asc' },
  { label: 'ตามตัวอักษร (Descending)', value: 'name-desc' },
]

const categoryLabel = computed(
  () => categoryOptions.find((option) => option.value === category.value)?.label ?? 'บริการทั้งหมด',
)

const sortLabel = computed(
  () => sortOptions.find((option) => option.value === sort.value)?.label ?? sort.value,
)

const priceLabel = computed(() => `${priceMin.value}-${priceMax.value}฿`)

const fillStyle = computed(() => {
  const left = (priceMin.value / PRICE_CEILING) * 100
  const width = ((priceMax.value - priceMin.value) / PRICE_CEILING) * 100
  return { left: `${left}%`, width: `${width}%` }
})

function toggle(key: FilterKey) {
  openKey.value = openKey.value === key ? null : key
}

function select(key: 'category' | 'sort', value: string) {
  if (key === 'category') category.value = value
  if (key === 'sort') sort.value = value
  openKey.value = null
}

function onMinInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  priceMin.value = Math.min(value, priceMax.value)
}

function onMaxInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  priceMax.value = Math.max(value, priceMin.value)
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) {
    openKey.value = null
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <form ref="root" class="bar" @submit.prevent="emit('search')">
    <div class="bar__inner">
    <div class="bar__search">
      <span class="bar__search-icon" aria-hidden="true"></span>
      <input v-model="query" class="input" type="search" placeholder="ค้นหาบริการ..." />
    </div>

    <div class="filters">
      <div class="filter filter--category" :class="{ 'is-open': openKey === 'category' }">
        <span>หมวดหมู่บริการ</span>
        <button type="button" :aria-expanded="openKey === 'category'" @click="toggle('category')">
          <span class="filter__value">{{ categoryLabel }}</span>
          <span class="icon icon--caret"></span>
        </button>
        <ul>
          <li
            v-for="option in categoryOptions"
            :key="option.value"
            :class="{ 'is-selected': option.value === category }"
            @click="select('category', option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>

      <div class="filter" :class="{ 'is-open': openKey === 'price' }">
        <span>ราคา</span>
        <button type="button" :aria-expanded="openKey === 'price'" @click="toggle('price')">
          <span class="filter__value">{{ priceLabel }}</span>
          <span class="icon icon--caret"></span>
        </button>
        <div class="range-card price-panel" @click.stop>
          <p class="range-card__caption">{{ priceLabel }}</p>
          <div class="range-slider">
            <span class="range-slider__track"></span>
            <span class="range-slider__fill" :style="fillStyle"></span>
            <input
              class="range-slider__input"
              type="range"
              min="0"
              :max="PRICE_CEILING"
              step="100"
              :value="priceMin"
              @input="onMinInput"
            />
            <input
              class="range-slider__input"
              type="range"
              min="0"
              :max="PRICE_CEILING"
              step="100"
              :value="priceMax"
              @input="onMaxInput"
            />
          </div>
          <div class="range-card__bounds">
            <span
              class="range-card__value"
              :style="{ left: `${(priceMin / PRICE_CEILING) * 100}%` }"
            >
              {{ priceMin }}
            </span>
            <span
              class="range-card__value"
              :style="{ left: `${(priceMax / PRICE_CEILING) * 100}%` }"
            >
              {{ priceMax }}
            </span>
          </div>
        </div>
      </div>

      <div class="filter filter--sort" :class="{ 'is-open': openKey === 'sort' }">
        <span>เรียงตาม</span>
        <button type="button" :aria-expanded="openKey === 'sort'" @click="toggle('sort')">
          <span class="filter__value">{{ sortLabel }}</span>
          <span class="icon icon--caret"></span>
        </button>
        <ul>
          <li
            v-for="option in sortOptions"
            :key="option.value"
            :class="{ 'is-selected': option.value === sort }"
            @click="select('sort', option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>
    </div>

    <button class="btn btn--primary bar__submit" type="submit">ค้นหา</button>
    </div>
  </form>
</template>

<style scoped>
.bar {
  width: 100%;
  background: var(--white);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 10;
}

.bar__inner {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.bar__search {
  position: relative;
  flex: 0 0 16rem;
  width: 16rem;
}

.bar__search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  width: 1rem;
  height: 1rem;
  transform: translateY(-50%);
  background-color: var(--gray-400);
  pointer-events: none;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M20 20l-3-3'/%3E%3C/svg%3E")
    center / contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M20 20l-3-3'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.bar__search .input {
  width: 100%;
  padding-left: 2.5rem;
}

.bar__submit {
  flex-shrink: 0;
}

.bar :deep(.filter--sort) {
  width: max-content;
  min-width: 14.5rem;
}

.bar :deep(.filter--sort > button) {
  width: max-content;
  min-width: 100%;
  height: auto;
  min-height: 24px;
  white-space: nowrap;
}

.bar :deep(.filter--sort ul) {
  width: max-content;
  min-width: 100%;
}

.bar :deep(.filter__value) {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar :deep(.filter > button .icon) {
  flex-shrink: 0;
}

.price-panel {
  display: none;
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  z-index: 30;
  min-width: 16rem;
}

.filter.is-open .price-panel {
  display: block;
}

@media (max-width: 768px) {
  .bar__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'search submit'
      'filters filters';
    align-items: center;
    column-gap: 0.5rem;
    row-gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .bar__search {
    grid-area: search;
    flex: none;
    min-width: 0;
    max-width: none;
  }

  .bar__submit {
    grid-area: submit;
    width: auto;
    height: 2.5rem;
    padding: 0 1.25rem;
    justify-self: end;
  }

  .filters {
    grid-area: filters;
    width: 100%;
    min-width: 0;
    gap: 0.75rem;
  }

  .bar :deep(.filters .filter + .filter::before) {
    left: -0.375rem;
    height: 2.25rem;
  }

  .bar :deep(.filter) {
    flex: 0 1 auto;
    width: auto;
    min-width: 0;
  }

  .bar :deep(.filter > span) {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar :deep(.filter > button) {
    width: auto;
    max-width: 100%;
    min-width: 0;
  }

  .bar :deep(.filter--sort) {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }

  .bar :deep(.filter--sort > button) {
    width: 100%;
    min-width: 0;
  }

  .bar :deep(.filter ul) {
    width: min(11.25rem, calc(100vw - 2rem));
  }

  .bar :deep(.filter--sort ul) {
    left: auto;
    right: 0;
    width: max-content;
    max-width: calc(100vw - 2rem);
  }

  .price-panel {
    left: 50%;
    min-width: 0;
    width: min(16rem, calc(100vw - 2rem));
    transform: translateX(-50%);
  }
}
</style>
