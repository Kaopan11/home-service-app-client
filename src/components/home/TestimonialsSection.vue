<script setup lang="ts">
const stats = [
  { value: '100+', label: 'ทีมช่างมืออาชีพ' },
  { value: '10,000+', label: 'งานที่สำเร็จแล้ว' },
  { value: '24 ชม.', label: 'พร้อมให้บริการ' },
]

const testimonials = [
  {
    quote: 'จองง่าย ช่างมาตรงเวลา งานเสร็จเรียบร้อย ประทับใจมากค่ะ',
    author: 'คุณสมศรี จันทร์อังคาร',
  },
  {
    quote: 'ราคาชัดเจนตั้งแต่แรก ไม่มีค่าใช้จ่ายแอบแฝง แนะนำเลยครับ',
    author: 'คุณอนุชา พงษ์ไพร',
  },
  {
    quote: 'ใช้บริการซ่อมแอร์ ช่างมีความรู้ อธิบายปัญหาให้ฟังอย่างละเอียด',
    author: 'คุณนภัสสร วงศ์ทอง',
  },
]
</script>

<template>
  <section class="testimonials">
    <div class="testimonials__stats">
      <div v-for="stat in stats" :key="stat.label" class="testimonials__stat">
        <span class="text-headline-1">{{ stat.value }}</span>
        <span class="text-body-3">{{ stat.label }}</span>
      </div>
    </div>

    <h2 class="text-headline-1">เสียงจากลูกค้าของเรา</h2>
    <div class="testimonials__grid">
      <blockquote v-for="testimonial in testimonials" :key="testimonial.author" class="testimonials__card">
        <p class="text-body-2">“{{ testimonial.quote }}”</p>
        <footer class="text-body-3">{{ testimonial.author }}</footer>
      </blockquote>
    </div>
  </section>
</template>

<style scoped>
.testimonials {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.testimonials__stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
}

.testimonials__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.testimonials__stat .text-headline-1 {
  color: var(--blue-600);
}

.testimonials__stat .text-body-3 {
  color: var(--gray-700);
}

.testimonials__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.testimonials__card {
  margin: 0;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  text-align: left;
}

.testimonials__card p {
  color: var(--gray-800);
}

.testimonials__card footer {
  margin-top: 1rem;
  color: var(--gray-500);
}

@media (max-width: 768px) {
  .testimonials {
    padding: 0 1rem;
  }

  .testimonials__stats {
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .testimonials__grid {
    grid-template-columns: 1fr;
  }
}
</style>
