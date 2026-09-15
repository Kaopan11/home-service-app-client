<script setup lang="ts">
import { icons } from '@/constants/icons'
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <img class="footer__brand-icon" src="/icons/brand/house.svg" alt="" width="32" height="32" />
        <span class="text-headline-3">HomeServices</span>
      </div>

      <div class="footer__company">
        <p class="footer__company-name text-body-3">บริษัท โฮมเซอร์วิสเซส จำกัด</p>
        <p class="footer__address text-body-4">
          452 ซอยสุขุมวิท 79 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10260
        </p>
      </div>

      <div class="footer__contacts">
        <p class="footer__contact text-body-3">
          <img :src="icons.contact.phone" alt="" width="20" height="20" />
          080-540-6357
        </p>
        <p class="footer__contact text-body-3">
          <img :src="icons.contact.email" alt="" width="20" height="20" />
          contact@homeservices.co
        </p>
      </div>
    </div>

    <div class="footer__legal">
      <div class="footer__legal-inner">
        <p class="footer__copy text-body-4">
          copyright © 2021 HomeServices.com All rights reserved
        </p>
        <nav class="footer__links text-body-4">
          <a href="#">เงื่อนไขและข้อตกลงการใช้งานเว็บไซต์</a>
          <a href="#">นโยบายความเป็นส่วนตัว</a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--white);
}

.footer__inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1.4fr) auto;
  align-items: center;
  gap: 2.5rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 2.25rem 2rem;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--btn-primary);
}

.footer__brand span {
  color: var(--btn-primary);
}

.footer__company {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.footer__company-name {
  color: var(--gray-950);
  font-weight: var(--font-weight-medium);
}

.footer__address {
  color: var(--gray-600);
}

.footer__contacts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__contact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gray-800);
}

.footer__legal {
  background: var(--gray-100);
}

.footer__legal-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
}

.footer__copy,
.footer__links,
.footer__links a {
  color: var(--gray-500);
  text-decoration: none;
}

.footer__links {
  display: flex;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .footer__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem 1.25rem;
  }

  .footer__legal-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.25rem;
  }

  .footer__copy {
    order: 1;
  }

  .footer__links {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
