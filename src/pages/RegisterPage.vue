<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { icons } from '@/constants/icons'
import TheHeader from '@/components/layout/TheHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { isApiError } from '@/types/auth'
import { startFacebookLogin } from '@/utils/facebookOAuth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  password: '',
  accepted: false,
})

const formError = ref('')
const submitting = ref(false)

async function handleSubmit(): Promise<void> {
  formError.value = ''
  if (!form.accepted) {
    formError.value = 'กรุณายอมรับข้อตกลงและเงื่อนไข'
    return
  }

  submitting.value = true
  try {
    await auth.register({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
      accepted: form.accepted,
    })
    await router.push({ name: 'home' })
  } catch (error) {
    formError.value = isApiError(error) ? error.message : 'ลงทะเบียนไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <TheHeader guest />
    <main>
      <section class="auth-card" aria-labelledby="register-title">
        <h1 id="register-title">ลงทะเบียน</h1>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <p v-if="formError" class="auth-error" role="alert">{{ formError }}</p>
          <div class="auth-fields">
            <label class="field">
              <span>ชื่อ - นามสกุล<em>*</em></span>
              <input
                v-model="form.fullName"
                type="text"
                name="fullName"
                autocomplete="name"
                placeholder="กรุณากรอกชื่อ นามสกุล"
              />
            </label>

            <label class="field">
              <span>เบอร์โทรศัพท์<em>*</em></span>
              <input
                v-model="form.phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
              />
            </label>

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
                autocomplete="new-password"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </label>
          </div>

          <label class="checkbox auth-terms">
            <input v-model="form.accepted" type="checkbox" name="accepted" />
            <span>
              ยอมรับ
              <a href="#">ข้อตกลงและเงื่อนไข</a>
              และ
              <a href="#">นโยบายความเป็นส่วนตัว</a>
            </span>
          </label>

          <button class="btn btn--primary" type="submit" :disabled="submitting">
            {{ submitting ? 'กำลังลงทะเบียน' : 'ลงทะเบียน' }}
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

        <RouterLink class="auth-back" :to="{ name: 'login' }">กลับไปหน้าเข้าสู่ระบบ</RouterLink>
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
  min-height: 832px;
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
  margin-bottom: 45px;
}

.auth-terms {
  margin-bottom: 42px;
  color: var(--gray-900);
  font-size: var(--body-2-size);
}

.auth-terms:hover {
  color: var(--gray-900);
}

.auth-terms a {
  font-weight: var(--font-weight-semibold);
  color: var(--blue-600);
  text-decoration: underline;
  text-underline-offset: 0.125rem;
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

.auth-back {
  align-self: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--body-2-size);
  line-height: var(--line-height);
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
    min-height: 0;
  }

  .auth-card h1,
  .auth-fields,
  .auth-terms,
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

  .auth-terms {
    align-items: flex-start;
  }
}
</style>
