<script setup lang="ts">
</script>

<template>
  <section class="recruit">
    <img
      class="recruit__image"
      src="/icons/homePage/ช่าง.svg"
      alt="ช่างมืออาชีพเตรียมอุปกรณ์"
    />
    <div class="recruit__content">
      <h2 class="text-headline-1">มาร่วมเป็นพนักงานซ่อม<br />กับ HomeServices</h2>
      <p class="text-body-2">
        เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี!<br />
        และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม
      </p>
      <p class="recruit__email text-headline-4">
        ติดต่อมาที่อีเมล: <a href="mailto:job@homeservices.co">job@homeservices.co</a>
      </p>
      <span class="recruit__mark" aria-hidden="true"></span>
    </div>
  </section>
</template>

<style scoped>
.recruit {
  display: flex;
  align-items: stretch;
}

.recruit__image {
  width: 24rem;
  max-width: 40%;
  object-fit: cover;
}

.recruit__content {
  position: relative;
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  background: var(--blue-600);
}

.recruit__content h2,
.recruit__content p,
.recruit__content a {
  position: relative;
  z-index: 1;
  color: var(--white);
}

.recruit__content a {
  text-decoration: underline;
}

.recruit__email {
  font-weight: var(--font-weight-semibold, 600);
}

.recruit__mark {
  position: absolute;
  right: -2rem;
  top: 50%;
  z-index: 0;
  width: 12rem;
  height: 12rem;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 0.15);
  mask: url('/icons/brand/house.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/brand/house.svg') center / contain no-repeat;
}

@media (max-width: 768px) {
  .recruit {
    flex-direction: column;
  }

  .recruit__image {
    width: 100%;
    max-width: none;
    height: 12rem;
  }

  .recruit__content {
    padding: 2rem 1.25rem;
  }
}
</style>
