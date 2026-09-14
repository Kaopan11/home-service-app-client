<script setup lang="ts">
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
</script>

<template>
  <main class="palette-page">
    <header class="palette-header">
      <h1>Color Palette</h1>
      <p class="subtitle">Home Service App design tokens — use CSS variables from <code>src/style.css</code></p>
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
          <span class="swatch__step">{{ swatch.step }}</span>
          <code class="swatch__token">{{ swatch.token }}</code>
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
          <span class="swatch__step">{{ swatch.step }}</span>
          <code class="swatch__token">{{ swatch.token }}</code>
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
            <span class="swatch__step">{{ accent.light.step }}</span>
            <code class="swatch__token">{{ accent.light.token }}</code>
          </div>
          <div
            class="swatch swatch--wide"
            :class="{ 'swatch--dark': accent.dark.dark }"
            :style="{ background: `var(${accent.dark.token})` }"
          >
            <span class="swatch__step">{{ accent.dark.step }}</span>
            <code class="swatch__token">{{ accent.dark.token }}</code>
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
          <span class="swatch__step">{{ item.name }}</span>
          <code class="swatch__token">{{ item.token }}</code>
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
        <p class="text-body">
          Body text using <code>--text</code> — <strong>heading text using --text-h</strong>
        </p>
        <p class="text-error">Error message using --red</p>
        <div class="card">Card on --white with --bg surface</div>
      </div>
    </section>
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
  font-size: 0.75rem;
  font-weight: 600;
}

.swatch__token {
  font-size: 0.625rem;
  padding: 0;
  background: transparent;
  color: inherit;
  opacity: 0.85;
}

.swatch--dark .swatch__token {
  background: transparent;
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

.text-body {
  color: var(--text);
}

.text-body strong {
  color: var(--text-h);
}

.text-error {
  color: var(--red);
  font-weight: 500;
}

.card {
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-h);
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
}
</style>
