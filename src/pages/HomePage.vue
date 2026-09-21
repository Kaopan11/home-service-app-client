<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import PopularServicesSection from '@/components/home/PopularServicesSection.vue'
import RecruitBanner from '@/components/home/RecruitBanner.vue'
</script>

<template>
  <div class="home-page">
    <TheHeader />
    <HomeHeroSection />
    <PopularServicesSection />
    <RecruitBanner />
    <TheFooter />
  </div>
</template>
