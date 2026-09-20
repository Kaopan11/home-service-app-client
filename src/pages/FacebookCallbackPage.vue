<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { isApiError } from '@/types/auth'
import { readFacebookCallbackParams } from '@/utils/facebookOAuth'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  // 1) อ่าน token หรือ error จาก URL ที่ Facebook ส่งกลับมา
  const params = readFacebookCallbackParams()
  const denied = params.get('error_description') || params.get('error')
  if (denied) {
    error.value = denied
    return
  }

  const accessToken = params.get('access_token')
  if (!accessToken) {
    error.value = 'เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ'
    return
  }

  try {
    // 2) ส่ง token ให้ Spring เพื่อสร้าง/หา user แล้วเก็บ session
    await auth.loginFacebook({
      accessToken,
      refreshToken: params.get('refresh_token') || '-',
      expiresIn: Number(params.get('expires_in')) > 0 ? Number(params.get('expires_in')) : 3600,
    })
    history.replaceState(null, '', window.location.pathname)
    await router.replace({ name: 'home' })
  } catch (caught) {
    error.value = isApiError(caught) ? caught.message : 'เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ'
  }
})
</script>

<template>
  <div class="auth-page">
    <TheHeader guest />
    <main>
      <section class="auth-card" aria-labelledby="facebook-callback-title" aria-live="polite">
        <h1 id="facebook-callback-title">เข้าสู่ระบบด้วย Facebook</h1>
        <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
        <p v-else>กำลังเข้าสู่ระบบ...</p>
        <p v-if="error" class="auth-footer">
          <RouterLink :to="{ name: 'login' }">กลับไปหน้าเข้าสู่ระบบ</RouterLink>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100svh;
  background: var(--bg);
}

.auth-page main {
  display: flex;
  justify-content: center;
  padding: 52px 16px 80px;
}

.auth-card {
  box-sizing: border-box;
  width: 614px;
  max-width: 100%;
  padding: 32px 87px 45px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  text-align: center;
}

.auth-card h1 {
  margin: 0 0 16px;
  color: var(--blue-950);
}

.auth-error {
  margin: 0 0 16px;
  color: var(--red);
  font-size: var(--body-3-size);
}

.auth-footer a {
  font-weight: var(--font-weight-semibold);
  font-size: var(--body-2-size);
  color: var(--blue-600);
  text-decoration: underline;
  text-underline-offset: 0.125rem;
}

@media (max-width: 768px) {
  .auth-card {
    width: 343px;
    padding: 32px 16px;
  }
}
</style>
