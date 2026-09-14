<script setup lang="ts">
const typographyStyles = [
  { name: 'Headline1', className: 'text-headline-1', weight: '500', size: '32px' },
  { name: 'Headline2', className: 'text-headline-2', weight: '500', size: '20px' },
  { name: 'Headline3', className: 'text-headline-3', weight: '400', size: '20px' },
  { name: 'Headline4', className: 'text-headline-4', weight: '500', size: '18px' },
  { name: 'Headline5', className: 'text-headline-5', weight: '500', size: '16px' },
  { name: 'Body1', className: 'text-body-1', weight: '400', size: '20px' },
  { name: 'Body2', className: 'text-body-2', weight: '300', size: '16px' },
  { name: 'Body3', className: 'text-body-3', weight: '400', size: '14px' },
  { name: 'Body4', className: 'text-body-4', weight: '400', size: '12px' },
  { name: 'Button', className: 'text-button', weight: '600', size: '16px' },
]
</script>

<template>
  <main class="typography-page">
    <header class="typography-header">
      <h1>Typography</h1>
      <p class="text-body-2 typography-subtitle">
        TechUp Home Services — Prompt font tokens from <code>src/style.css</code>
      </p>
    </header>

    <section class="typography-section">
      <h2>Text Styles</h2>
      <ul class="typography-list">
        <li v-for="style in typographyStyles" :key="style.name" class="typography-item">
          <div class="typography-item__preview">
            <p :class="style.className">{{ style.name }}</p>
          </div>
          <div class="typography-item__meta text-body-4">
            <span>{{ style.className }}</span>
            <span>{{ style.weight }} / {{ style.size }} / 150%</span>
          </div>
        </li>
      </ul>
    </section>

    <section class="typography-section">
      <h2>Sample Content</h2>
      <div class="typography-sample">
        <p class="text-headline-1">บริการซ่อมบำรุงบ้านครบวงจร</p>
        <p class="text-headline-2">จองช่างได้ง่าย ปลอดภัย มั่นใจ</p>
        <p class="text-body-2">
          Home Service App helps you find trusted technicians for every home maintenance need.
        </p>
        <p class="text-body-3">รองรับทั้งภาษาไทยและ English typography.</p>
        <button type="button" class="text-button typography-link">ดูรายละเอียดเพิ่มเติม</button>
      </div>
    </section>

    <nav class="typography-nav text-body-3">
      <RouterLink to="/design/colors">Color Palette</RouterLink>
    </nav>
  </main>
</template>

<style scoped>
.typography-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.typography-header {
  margin-bottom: 2.5rem;
}

.typography-subtitle {
  color: var(--gray-500);
}

.typography-section + .typography-section {
  margin-top: 2.5rem;
}

.typography-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.typography-item {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
}

.typography-item__preview {
  margin-bottom: 0.5rem;
}

.typography-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  color: var(--gray-500);
}

.typography-sample {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
}

.typography-link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.typography-nav a {
  color: var(--blue-600);
  text-decoration: none;
}

.typography-nav a:hover {
  text-decoration: underline;
}
</style>
