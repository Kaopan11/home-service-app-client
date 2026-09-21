<script setup lang="ts">
</script>

<template>
  <section class="cta">
    <h2 class="text-headline-1">พร้อมให้บริการคุณแล้ววันนี้</h2>
    <p class="text-body-2">จองบริการช่างมืออาชีพได้ง่ายๆ ภายในไม่กี่คลิก</p>
    <RouterLink to="/service" class="btn btn--primary btn--large">จองบริการเลย</RouterLink>
  </section>
</template>

<style scoped>
.cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 3.5rem 2rem;
  text-align: center;
}

.cta p {
  color: var(--gray-700);
}

@media (max-width: 768px) {
  .cta {
    padding: 2rem 1.25rem;
  }
}
</style>
