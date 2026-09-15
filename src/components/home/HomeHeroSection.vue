<script setup lang="ts">
</script>

<template>
  <section class="home-hero">
    <div class="home-hero__content">
      <h1 class="text-headline-1">เรื่องบ้าน...ให้เราช่วยดูแลคุณ</h1>
      <p class="home-hero__tagline text-headline-4">“สะดวก ราคาคุ้มค่า เชื่อถือได้”</p>
      <p class="text-body-2">
        ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน<br />
        โดยพนักงานแม่บ้าน และช่างมืออาชีพ
      </p>
      <RouterLink to="/service" class="btn btn--primary btn--large home-hero__cta">เช็คราคาบริการ</RouterLink>
    </div>
    <img class="home-hero__image" src="/icons/homePage/human.svg" alt="ช่างมืออาชีพของเรา" />
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  min-height: 33.75rem;
  overflow: hidden;
  background: var(--blue-100);
  border-radius: 0 0 2.5rem 2.5rem;
}

.home-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 60rem;
  padding: 78px 1rem 2.75rem 162px;
}

.home-hero__content h1 {
  max-width: 767px;
  color: var(--blue-700);
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.5;
}

.home-hero__tagline {
  color: var(--black);
  font-size: 2.625rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  letter-spacing: 0;
}

.home-hero__content p.text-body-2 {
  color: var(--gray-700);
  font-size: 1.5rem;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  letter-spacing: 0;
}

.home-hero__cta {
  gap: 10px;
  margin-top: 84px;
  padding: 12px 32px;
  font-size: 1.25rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.home-hero__image {
  position: absolute;
  top: 47px;
  right: 110px;
  width: 520px;
  max-width: 50%;
  height: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .home-hero {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-radius: 0 0 1.5rem 1.5rem;
    text-align: center;
  }

  .home-hero__content {
    align-items: center;
    max-width: none;
    padding: 2rem 1.25rem 1rem;
  }

  .home-hero__content h1 {
    font-size: 1.75rem;
  }

  .home-hero__tagline {
    font-size: 1.5rem;
  }

  .home-hero__content p.text-body-2 {
    font-size: 1rem;
    line-height: 1.4;
  }

  .home-hero__cta {
    margin-top: 0;
  }

  .home-hero__image {
    position: static;
    align-self: center;
    width: 60%;
    height: auto;
    max-width: 60%;
    margin: 0 auto;
  }
}
</style>
