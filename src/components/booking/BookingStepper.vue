<script setup lang="ts">
defineProps<{
  currentStep?: number
}>()

const steps = [
  { id: 1, label: 'รายการ' },
  { id: 2, label: 'กรอกข้อมูลบริการ' },
  { id: 3, label: 'ชำระเงิน' },
] as const
</script>

<template>
  <ol class="stepper" aria-label="ขั้นตอนการจองบริการ">
    <li
      v-for="(step, index) in steps"
      :key="step.id"
      class="stepper__item"
      :class="{
        'is-current': (currentStep ?? 1) === step.id,
        'is-upcoming': (currentStep ?? 1) < step.id,
      }"
      :aria-current="(currentStep ?? 1) === step.id ? 'step' : undefined"
    >
      <div class="stepper__node">
        <span class="stepper__icon" aria-hidden="true">
          <svg v-if="step.id === 1" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
              fill="currentColor"
            />
            <path
              d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z"
              fill="currentColor"
            />
          </svg>
          <svg v-else-if="step.id === 2" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 5H6C4.895 5 4 5.895 4 7V18C4 19.105 4.895 20 6 20H17C18.105 20 19 19.105 19 18V13M17.586 3.586A2 2 0 0 1 20.414 6.414L11.828 15H9V12.172L17.586 3.586Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="6"
              width="18"
              height="12"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" />
            <path d="M7 15H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="stepper__label text-body-3">{{ step.label }}</span>
      </div>
      <span v-if="index < steps.length - 1" class="stepper__line" aria-hidden="true" />
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  max-width: 36rem;
  margin: 0 auto;
  padding: 1.5rem 1.5rem;
  list-style: none;
  background: transparent;
}

.stepper__item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.stepper__item:last-child {
  flex: 0 0 auto;
}

.stepper__node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 7.25rem;
}

.stepper__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 3px solid var(--blue-600);
  background: var(--white);
  color: var(--blue-600);
}

.is-current .stepper__icon {
  background: var(--blue-600);
  color: var(--white);
}

.stepper__label {
  font-weight: var(--font-weight-medium);
  color: var(--gray-500);
  white-space: nowrap;
}

.is-current .stepper__label {
  color: var(--blue-600);
}

.stepper__line {
  flex: 1;
  height: 2px;
  margin: 0 0.75rem 1.75rem;
  background: var(--gray-300);
}

@media (max-width: 768px) {
  .stepper {
    padding: 1rem 0.75rem;
  }

  .stepper__node {
    min-width: 3.75rem;
  }

  .stepper__icon {
    width: 2rem;
    height: 2rem;
  }

  .stepper__icon svg {
    width: 16px;
    height: 16px;
  }

  .stepper__line {
    margin: 0 0.35rem 1.5rem;
  }
}
</style>
