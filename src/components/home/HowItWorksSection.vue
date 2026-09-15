<script setup lang="ts">
const steps = [
  {
    title: 'เลือกบริการ',
    description: 'เลือกบริการที่ต้องการจากรายการบริการทั้งหมดของเรา',
  },
  {
    title: 'จองคิว',
    description: 'เลือกวันและเวลาที่สะดวก แล้วยืนยันการจอง',
  },
  {
    title: 'ช่างเข้าให้บริการ',
    description: 'ช่างมืออาชีพเดินทางไปถึงหน้าบ้านคุณตามเวลานัดหมาย',
  },
  {
    title: 'ชำระเงิน',
    description: 'ชำระเงินหลังงานเสร็จเรียบร้อย พร้อมรับประกันคุณภาพงาน',
  },
]
</script>

<template>
  <section class="how-it-works">
    <h2 class="text-headline-1">ใช้งานง่ายใน 4 ขั้นตอน</h2>
    <ol class="how-it-works__steps">
      <li v-for="(step, index) in steps" :key="step.title" class="how-it-works__step">
        <span class="how-it-works__number">{{ index + 1 }}</span>
        <h3 class="text-headline-4">{{ step.title }}</h3>
        <p class="text-body-3">{{ step.description }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.how-it-works {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.how-it-works__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
}

.how-it-works__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
}

.how-it-works__number {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  border-radius: 9999px;
  background: var(--blue-100);
  color: var(--blue-700);
  font-weight: var(--font-weight-semibold);
}

.how-it-works__step p {
  color: var(--gray-700);
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 0 1rem;
  }

  .how-it-works__steps {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
</style>
