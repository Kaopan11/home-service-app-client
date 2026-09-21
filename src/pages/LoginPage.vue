<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { icons } from '@/constants/icons'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { startFacebookLogin } from '@/services/auth'
import { isApiError } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const formError = ref('')
const submitting = ref(false)

async function handleSubmit(): Promise<void> {
  formError.value = ''
  submitting.value = true
  try {
    const nextUser = await auth.loginCustomer({
      email: form.email.trim(),
      password: form.password,
    })
    if (nextUser.role === 'TECHNICIAN') {
      await router.push({ name: 'technician-account' })
      return
    }
    const redirect = route.query.redirect
    const safeRedirect =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    await router.push(safeRedirect ? redirect : { name: 'home' })
  } catch (error) {
    formError.value = isApiError(error) ? error.message : 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <TheHeader guest />
    <main>
      <section class="auth-card" aria-labelledby="login-title">
        <h1 id="login-title">เข้าสู่ระบบ</h1>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <p v-if="formError" class="auth-error" role="alert">{{ formError }}</p>
          <div class="auth-fields">
            <label class="field">
              <span>อีเมล<em>*</em></span>
              <input
                v-model="form.email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="กรุณากรอกอีเมล"
              />
            </label>

            <label class="field">
              <span>รหัสผ่าน<em>*</em></span>
              <input
                v-model="form.password"
                type="password"
                name="password"
                autocomplete="current-password"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </label>
          </div>

          <button class="btn btn--primary" type="submit" :disabled="submitting">
            {{ submitting ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ' }}
          </button>
        </form>

        <p class="auth-divider">หรือลงชื่อเข้าใช้ผ่าน</p>

        <button class="btn btn--secondary auth-facebook" type="button" @click="startFacebookLogin">
          <img
            :src="icons.brand.facebook"
            width="23"
            height="22"
            alt=""
          />
          เข้าสู่ระบบด้วย Facebook
        </button>

        <p class="auth-footer">
          ยังไม่มีบัญชีผู้ใช้ HomeService?
          <RouterLink :to="{ name: 'register' }">ลงทะเบียน</RouterLink>
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 614px;
  max-width: 100%;
  padding: 32px 87px 45px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
}

.auth-card h1 {
  margin: 0 0 16px;
  text-align: center;
  color: var(--blue-950);
}

.auth-error {
  margin: 0 0 16px;
  color: var(--red);
  font-size: var(--body-3-size);
}

.auth-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.auth-form .btn--primary {
  width: 100%;
  margin-bottom: 32px;
  font-weight: var(--font-weight-medium);
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 31px;
  font-size: var(--body-3-size);
  color: #636678;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-500);
}

.auth-facebook {
  width: 100%;
  margin-bottom: 36px;
  gap: 16px;
  font-weight: var(--font-weight-medium);
}

.auth-facebook img {
  display: block;
  width: 23px;
  height: 22px;
}

.auth-footer {
  text-align: center;
  font-size: var(--body-3-size);
  color: var(--gray-700);
}

.auth-footer a {
  font-weight: var(--font-weight-semibold);
  font-size: var(--body-2-size);
  color: var(--blue-600);
  text-decoration: underline;
  text-underline-offset: 0.125rem;
}

@media (max-width: 768px) {
  .auth-page main {
    padding: 40px 16px 24px;
  }

  .auth-card {
    width: 343px;
    padding: 32px 16px;
    gap: 24px;
  }

  .auth-card h1,
  .auth-fields,
  .auth-form .btn--primary,
  .auth-divider,
  .auth-facebook {
    margin: 0;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .auth-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: var(--body-2-size);
  }
}
</style>
