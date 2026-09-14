<script setup lang="ts">
// Add Navbar, Sidebar, and other shell components here.
</script>

<template>
  <div class="app-layout">
    <main class="app-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100svh;
}

.app-layout__main {
  min-height: inherit;
}
</style>
