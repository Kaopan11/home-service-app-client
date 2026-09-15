<template>
  <section class="hero">
    <div class="hero__overlay">
      <h1>บริการของเรา</h1>
      <p class="text-body-3">
        ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน รวมถึง งานช่างหลายประเภท
        ให้ครบจบในเว็บเดียว โดยช่างมืออาชีพ
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 20rem;
  background:
    linear-gradient(90deg, rgb(18 24 38 / 0.78) 0%, rgb(18 24 38 / 0.4) 100%),
    url('https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80')
      center / cover;
}

.hero__overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: inherit;
  padding: 4.5rem 1.5rem;
  text-align: center;
}

.hero h1,
.hero p {
  max-width: 36rem;
  color: var(--white);
}

@media (max-width: 768px) {
  .hero {
    min-height: 10rem;
  }

  .hero__overlay {
    gap: 0.5rem;
    padding: 1.5rem 1.25rem;
  }

  .hero h1 {
    font-size: 1.5rem;
  }

  .hero p {
    font-size: var(--body-4-size);
  }
}
</style>
