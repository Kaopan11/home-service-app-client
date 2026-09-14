<script setup lang="ts">
import { computed, ref } from 'vue'
import { DatePicker, TimePicker } from '@/components/ui'

type ScaleStep = {
  step: string
  token: string
  dark: boolean
}

type AccentPair = {
  name: string
  light: ScaleStep
  dark: ScaleStep
}

type UtilityColor = {
  name: string
  token: string
  dark: boolean
}

const scaleSteps = ['100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

const blueScale: ScaleStep[] = scaleSteps.map((step) => ({
  step,
  token: `--blue-${step}`,
  dark: Number(step) >= 500,
}))

const grayScale: ScaleStep[] = scaleSteps.map((step) => ({
  step,
  token: `--gray-${step}`,
  dark: Number(step) >= 500,
}))

const accents: AccentPair[] = [
  {
    name: 'Purple',
    light: { step: '100', token: '--purple-100', dark: false },
    dark: { step: '900', token: '--purple-900', dark: true },
  },
  {
    name: 'Yellow',
    light: { step: '100', token: '--yellow-100', dark: false },
    dark: { step: '900', token: '--yellow-900', dark: true },
  },
  {
    name: 'Green',
    light: { step: '100', token: '--green-100', dark: false },
    dark: { step: '900', token: '--green-900', dark: true },
  },
]

const utilities: UtilityColor[] = [
  { name: 'Black', token: '--black', dark: true },
  { name: 'White', token: '--white', dark: false },
  { name: 'Red', token: '--red', dark: true },
  { name: 'BG', token: '--bg', dark: false },
]

const dropdownOptions = ['Place Holder', 'Place Holder', 'Place Holder', 'Place Holder']
const openDropdowns = ref({ left: true, right: true })

function toggleDropdown(id: 'left' | 'right') {
  openDropdowns.value[id] = !openDropdowns.value[id]
}

const uploadActive = ref(false)

const RANGE_MAX = 2000
const rangeMin = ref(0)
const rangeMax = ref(1600)

function onRangeMin(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  rangeMin.value = Math.min(value, rangeMax.value)
}

function onRangeMax(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  rangeMax.value = Math.max(value, rangeMin.value)
}

function valueFromPointer(event: PointerEvent, slider: HTMLElement) {
  const rect = slider.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  return Math.round(ratio * RANGE_MAX)
}

function applyRangeThumb(thumb: 'min' | 'max', value: number) {
  if (thumb === 'min') {
    rangeMin.value = Math.min(value, rangeMax.value)
    return
  }
  rangeMax.value = Math.max(value, rangeMin.value)
}

function onRangeTrack(event: PointerEvent) {
  if (event.target instanceof HTMLInputElement) return

  const slider = event.currentTarget as HTMLElement
  const value = valueFromPointer(event, slider)
  const thumb =
    Math.abs(value - rangeMin.value) <= Math.abs(value - rangeMax.value) ? 'min' : 'max'
  applyRangeThumb(thumb, value)

  const onMove = (moveEvent: PointerEvent) => {
    applyRangeThumb(thumb, valueFromPointer(moveEvent, slider))
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

const rangeFillStyle = computed(() => {
  const left = (rangeMin.value / RANGE_MAX) * 100
  const width = ((rangeMax.value - rangeMin.value) / RANGE_MAX) * 100
  return { left: `${left}%`, width: `${width}%` }
})

function rangeValueStyle(value: number) {
  const pct = (value / RANGE_MAX) * 100
  return { left: `calc(${pct / 100} * (100% - 16px) + 8px)` }
}

const demoDate = ref<Date | null>(new Date(2021, 10, 17))
const demoTime = ref<string | null>(null)
</script>

<template>
  <main class="palette-page">
    <header class="palette-header">
      <h1>Color Palette</h1>
      <p class="text-body-2 subtitle">Home Service App design tokens — use CSS variables from <code>src/style.css</code></p>
    </header>

    <section class="palette-section">
      <h2>Blue</h2>
      <div class="swatch-row">
        <div
          v-for="swatch in blueScale"
          :key="swatch.token"
          class="swatch"
          :class="{ 'swatch--dark': swatch.dark }"
          :style="{ background: `var(${swatch.token})` }"
        >
          <span class="swatch__step text-body-4">{{ swatch.step }}</span>
          <code class="swatch__token text-body-4">{{ swatch.token }}</code>
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>Gray</h2>
      <div class="swatch-row">
        <div
          v-for="swatch in grayScale"
          :key="swatch.token"
          class="swatch"
          :class="{ 'swatch--dark': swatch.dark }"
          :style="{ background: `var(${swatch.token})` }"
        >
          <span class="swatch__step text-body-4">{{ swatch.step }}</span>
          <code class="swatch__token text-body-4">{{ swatch.token }}</code>
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>Accent</h2>
      <div v-for="accent in accents" :key="accent.name" class="accent-group">
        <h3>{{ accent.name }}</h3>
        <div class="swatch-row swatch-row--accent">
          <div
            class="swatch swatch--wide"
            :class="{ 'swatch--dark': accent.light.dark }"
            :style="{ background: `var(${accent.light.token})` }"
          >
            <span class="swatch__step text-body-4">{{ accent.light.step }}</span>
            <code class="swatch__token text-body-4">{{ accent.light.token }}</code>
          </div>
          <div
            class="swatch swatch--wide"
            :class="{ 'swatch--dark': accent.dark.dark }"
            :style="{ background: `var(${accent.dark.token})` }"
          >
            <span class="swatch__step text-body-4">{{ accent.dark.step }}</span>
            <code class="swatch__token text-body-4">{{ accent.dark.token }}</code>
          </div>
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>Utility</h2>
      <div class="swatch-row swatch-row--utility">
        <div
          v-for="item in utilities"
          :key="item.token"
          class="swatch swatch--wide"
          :class="{ 'swatch--dark': item.dark }"
          :style="{ background: `var(${item.token})` }"
        >
          <span class="swatch__step text-body-4">{{ item.name }}</span>
          <code class="swatch__token text-body-4">{{ item.token }}</code>
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>Inputs</h2>
      <div class="input-gallery">
        <div class="input-field">
          <label class="input-label" for="input-default">Default</label>
          <input id="input-default" class="input" type="text" placeholder="Place Holder" />
        </div>
        <div class="input-field">
          <label class="input-label" for="input-focus">Focus</label>
          <input
            id="input-focus"
            class="input input--focus"
            type="text"
            placeholder="Place Holder"
          />
        </div>
        <div class="input-field">
          <label class="input-label" for="input-success">Success</label>
          <input
            id="input-success"
            class="input input--success"
            type="text"
            placeholder="Place Holder"
          />
        </div>
        <div class="input-field">
          <label class="input-label" for="input-disabled">Disable</label>
          <input id="input-disabled" class="input" type="text" placeholder="Place Holder" disabled />
        </div>
        <div class="input-field">
          <label class="input-label" for="input-error">Error</label>
          <input
            id="input-error"
            class="input input--error"
            type="text"
            placeholder="Place Holder"
          />
          <p class="input-error">Error Massage</p>
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>Form Controls</h2>
      <div class="control-gallery">
        <div class="control-block">
          <h3 class="control-block__title">Dropdown</h3>
          <div
            class="dropdown"
            :class="{ 'dropdown--open': openDropdowns.left }"
          >
            <button
              class="input dropdown__trigger"
              type="button"
              :aria-expanded="openDropdowns.left ? 'true' : 'false'"
              @click="toggleDropdown('left')"
            >
              <span class="dropdown__value dropdown__value--placeholder">Place Holder</span>
              <span class="icon icon--chevron" aria-hidden="true"></span>
            </button>
            <div class="dropdown__menu" role="listbox">
              <button
                v-for="(option, index) in dropdownOptions"
                :key="`left-${index}`"
                class="dropdown__option"
                type="button"
                role="option"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <div class="control-block">
          <h3 class="control-block__title">Dropdown</h3>
          <div
            class="dropdown"
            :class="{ 'dropdown--open': openDropdowns.right }"
          >
            <button
              class="input dropdown__trigger input--focus"
              type="button"
              :aria-expanded="openDropdowns.right ? 'true' : 'false'"
              @click="toggleDropdown('right')"
            >
              <span class="dropdown__value dropdown__value--placeholder">Place Holder</span>
              <span class="icon icon--chevron" aria-hidden="true"></span>
            </button>
            <div class="dropdown__menu" role="listbox">
              <button
                v-for="(option, index) in dropdownOptions"
                :key="`right-${index}`"
                class="dropdown__option"
                :class="{ 'dropdown__option--active': index === 1 }"
                type="button"
                role="option"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <div class="control-block">
          <h3 class="control-block__title">Image Upload</h3>
          <div class="upload" :class="{ 'upload--active': uploadActive }">
            <label
              class="upload__dropzone"
              @dragenter.prevent="uploadActive = true"
              @dragover.prevent="uploadActive = true"
              @dragleave.prevent="uploadActive = false"
              @drop.prevent="uploadActive = false"
            >
              <input class="upload__input" type="file" accept="image/png,image/jpeg" />
              <svg class="upload__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="3.5" y="9" width="19" height="15" rx="2.5" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M7.5 20.5l3.8-3.8a2 2 0 012.8 0l5.4 5.4"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <circle cx="10.5" cy="14.5" r="1.2" fill="currentColor" />
                <circle cx="24" cy="10" r="5.2" fill="white" stroke="currentColor" stroke-width="1.6" />
                <path d="M24 7.6v4.8M21.6 10h4.8" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <span class="upload__title">อัพโหลดรูปภาพ หรือ ลากและวางที่นี่</span>
              <span class="upload__hint">PNG, JPG ขนาดไม่เกิน 10MB</span>
            </label>
            <p class="upload__instruction">Instruction: ...</p>
          </div>
        </div>

        <div class="control-block">
          <h3 class="control-block__title">Price Range</h3>
          <div class="range-card">
            <p class="range-card__caption">{{ rangeMin }}-{{ rangeMax }}฿</p>
            <div class="range-slider" @pointerdown="onRangeTrack">
              <div class="range-slider__track"></div>
              <div class="range-slider__fill" :style="rangeFillStyle"></div>
              <input
                class="range-slider__input"
                type="range"
                min="0"
                :max="RANGE_MAX"
                :value="rangeMin"
                aria-label="Minimum price"
                @input="onRangeMin"
              />
              <input
                class="range-slider__input"
                type="range"
                min="0"
                :max="RANGE_MAX"
                :value="rangeMax"
                aria-label="Maximum price"
                @input="onRangeMax"
              />
            </div>
            <div class="range-card__bounds">
              <span class="range-card__value" :style="rangeValueStyle(rangeMin)">{{ rangeMin }}</span>
              <span class="range-card__value" :style="rangeValueStyle(rangeMax)">{{ rangeMax }}</span>
            </div>
          </div>
        </div>

        <div class="control-block">
          <h3 class="control-block__title">Date Picker</h3>
          <DatePicker v-model="demoDate" default-open />
        </div>

        <div class="control-block">
          <h3 class="control-block__title">Time Picker</h3>
          <TimePicker v-model="demoTime" default-open />
        </div>
      </div>
    </section>

    <section class="palette-section">
      <h2>UI Preview</h2>
      <div class="ui-preview">
        <div class="ui-preview__actions">
          <button type="button" class="btn btn--primary">Primary Button</button>
          <button type="button" class="btn btn--secondary">Secondary</button>
        </div>
        <p class="text-body-2 preview-text">
          Body text using <code>--text</code> — <strong class="text-headline-5">heading text using --text-h</strong>
        </p>
        <p class="text-body-3 preview-error">Error message using --red</p>
        <div class="card text-body-2">Card on --white with --bg surface</div>
      </div>
    </section>

    <nav class="palette-nav text-body-3">
      <RouterLink to="/design/typography">Typography</RouterLink>
    </nav>
  </main>
</template>

<style scoped>
.palette-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.palette-header {
  margin-bottom: 2.5rem;
}

.subtitle {
  color: var(--gray-500);
}

.palette-section {
  margin-bottom: 2.5rem;
}

.swatch-row {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 4px;
}

.swatch-row--accent,
.swatch-row--utility {
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  max-width: 480px;
}

.swatch-row--utility {
  grid-template-columns: repeat(4, minmax(100px, 1fr));
  max-width: 640px;
}

.accent-group + .accent-group {
  margin-top: 1.5rem;
}

.swatch {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  padding: 8px;
  border: 1px solid var(--gray-200);
  color: var(--gray-900);
}

.swatch--wide {
  aspect-ratio: 2 / 1;
}

.swatch--dark {
  color: var(--white);
  border-color: transparent;
}

.swatch__step {
  font-weight: var(--font-weight-medium);
}

.swatch__token {
  padding: 0;
  background: transparent;
  color: inherit;
  opacity: 0.85;
}

.swatch--dark .swatch__token {
  background: transparent;
}

.input-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 2rem;
  max-width: 720px;
  padding: 1.5rem;
  background: var(--white);
  border: 1px dashed var(--blue-400);
  border-radius: 16px;
}

.control-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem 3rem;
  align-items: start;
}

.control-block__title {
  margin: 0 0 0.75rem;
  color: var(--gray-500);
  font-size: 1rem;
  font-weight: 600;
}

.ui-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.ui-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  font: inherit;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn--primary {
  background: var(--blue-500);
  color: var(--white);
  border: none;
}

.btn--primary:hover {
  background: var(--blue-600);
}

.btn--secondary {
  background: var(--gray-100);
  color: var(--gray-900);
  border: 1px solid var(--gray-300);
}

.btn--secondary:hover {
  background: var(--gray-200);
}

.preview-text {
  color: var(--text);
}

.preview-text strong {
  color: var(--text-h);
}

.preview-error {
  color: var(--red);
  font-weight: var(--font-weight-medium);
}

.card {
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-h);
}

.palette-nav {
  margin-top: 2rem;
}

.palette-nav a {
  color: var(--blue-600);
  text-decoration: none;
}

.palette-nav a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .swatch-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .swatch-row--utility {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }
}

@media (max-width: 540px) {
  .swatch-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .swatch-row--accent {
    max-width: none;
  }

  .input-gallery,
  .control-gallery {
    grid-template-columns: 1fr;
  }
}
</style>
