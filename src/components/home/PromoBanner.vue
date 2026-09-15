<template>
  <section class="promo">
    <div class="promo__copy">
      <p class="text-headline-4">
        เพราะเราคือช่าง ผู้ให้บริการเรื่องบ้านอันดับ 1 แบบครบวงจร โดยทีมช่างมืออาชีพมากกว่า 100 ทีม
        สามารถตอบโจทย์ด้านการบริการเรื่องบ้านของคุณ และสร้าง
        ความสะดวกสบายในการติดต่อกับทีมช่าง ได้ทุกที่ ทุกเวลา ตลอด 24 ชม.
        มั่นใจ ช่างไม่ทิ้งงาน พร้อมรับประกันคุณภาพงาน
      </p>
    </div>
    <div class="promo__mark" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
.promo {
  position: relative;
  overflow: hidden;
  padding: 3.5rem 1.5rem;
  background: var(--blue-600);
}

.promo__copy {
  position: relative;
  z-index: 1;
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
}

.promo p {
  color: var(--white);
}

.promo__mark {
  position: absolute;
  right: 8%;
  top: 50%;
  width: 14rem;
  height: 14rem;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 0.18);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='black' d='M8 28L32 8l24 20v28H40V40H24v16H8V28z'/%3E%3C/svg%3E")
    center / contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='black' d='M8 28L32 8l24 20v28H40V40H24v16H8V28z'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

@media (max-width: 768px) {
  .promo {
    padding: 2rem 1.25rem;
  }

  .promo__mark {
    width: 8rem;
    height: 8rem;
    right: -0.5rem;
  }
}
</style>
