<script setup lang="ts">
import { formatBaht, type ServiceOption } from '@/data/serviceDetails'

defineProps<{
  options: ServiceOption[]
  quantities: Record<string, number>
  title?: string
}>()

const emit = defineEmits<{
  increment: [id: string]
  decrement: [id: string]
}>()
</script>

<template>
  <section class="options">
    <h2 class="options__title">{{ title ?? 'เลือกรายการบริการของคุณ' }}</h2>
    <ul class="options__list">
      <li v-for="option in options" :key="option.id" class="options__item">
        <div class="options__info">
          <p class="options__name">{{ option.name }}</p>
          <p class="options__price">{{ formatBaht(option.price) }} / {{ option.unit }}</p>
        </div>
        <div class="qty" :aria-label="`จำนวน ${option.name}`">
          <button
            class="qty__btn qty__btn--minus"
            type="button"
            :disabled="(quantities[option.id] ?? 0) === 0"
            :aria-label="`ลดจำนวน ${option.name}`"
            @click="emit('decrement', option.id)"
          >
            −
          </button>
          <span class="qty__value">{{ quantities[option.id] ?? 0 }}</span>
          <button
            class="qty__btn qty__btn--plus"
            type="button"
            :aria-label="`เพิ่มจำนวน ${option.name}`"
            @click="emit('increment', option.id)"
          >
            +
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.options {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.options__title {
  margin-bottom: 0.5rem;
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.options__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.options__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--gray-300);
}

.options__item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.options__name {
  margin: 0;
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.options__price {
  margin: 0.25rem 0 0;
  font-size: var(--body-3-size);
  color: var(--gray-500);
}

.qty {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.qty__value {
  min-width: 1.25rem;
  text-align: center;
  font-weight: var(--font-weight-medium);
  color: var(--gray-950);
}

.qty__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--blue-600);
  background: var(--white);
  color: var(--blue-600);
  font-size: 1.125rem;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  cursor: pointer;
}

.qty__btn--plus {
  background: var(--blue-600);
  color: var(--white);
}

.qty__btn:hover:not(:disabled) {
  border-color: var(--blue-500);
}

.qty__btn--plus:hover:not(:disabled) {
  background: var(--blue-500);
}

.qty__btn:disabled {
  border-color: var(--blue-300);
  color: var(--blue-300);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .options {
    padding: 1rem;
  }

  .options__item {
    padding: 1rem 0;
  }

  .options__name {
    font-size: var(--body-3-size);
  }
}
</style>
