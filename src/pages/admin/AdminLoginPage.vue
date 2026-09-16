<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PasswordVisibilityToggle from '@/components/auth/PasswordVisibilityToggle.vue'
import { icons } from '@/constants/icons'
import { useAuthStore } from '@/stores/auth'
import { isApiError } from '@/types/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive({
  email: '',
  password: '',
})

const formError = ref('')
const showPassword = ref(false)
const submitting = ref(false)

function validate(): boolean {
  fieldErrors.email = ''
  fieldErrors.password = ''

  if (!form.email.trim()) {
    fieldErrors.email = 'กรุณากรอกอีเมล'
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    fieldErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  }

  if (!form.password) {
    fieldErrors.password = 'กรุณากรอกรหัสผ่าน'
  }

  return !fieldErrors.email && !fieldErrors.password
}

function applyApiFieldErrors(errors: { field: string; message: string }[]): void {
  for (const error of errors) {
    if (error.field === 'email' || error.field === 'password') {
      fieldErrors[error.field] = error.message
    }
  }
}

async function handleSubmit(): Promise<void> {
  formError.value = ''
  if (!validate()) {
    return
  }

  submitting.value = true
  try {
    await auth.login({
      email: form.email.trim(),
      password: form.password,
    })
    await router.push({ name: 'admin-categories' })
  } catch (error) {
    if (isApiError(error)) {
      if (error.code === 'VALIDATION_ERROR' && error.errors?.length) {
        applyApiFieldErrors(error.errors)
        return
      }
      if (error.code === 'FORBIDDEN_ROLE') {
        formError.value = error.message
        return
      }
      if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
        formError.value = error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        return
      }
      formError.value = error.message
      return
    }
    formError.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="brand">
      <img class="brand__icon" :src="icons.brand.house" width="70" height="70" alt="" />
      <span class="brand__name">HomeServices</span>
    </div>

    <section class="login-card" aria-labelledby="login-title">
      <h1 id="login-title" class="login-card__title">เข้าสู่ระบบแอดมิน</h1>

      <form class="login-form" @submit.prevent="handleSubmit">
        <p v-if="formError" class="login-form__alert" role="alert">{{ formError }}</p>

        <label class="login-field">
          <span class="login-field__label login-field__label--email">
            Email<span class="login-field__required">*</span>
          </span>
          <input
            v-model="form.email"
            class="login-field__input"
            type="email"
            name="email"
            autocomplete="username"
            placeholder="admin@example.com"
            :disabled="submitting"
          />
          <span v-if="fieldErrors.email" class="login-field__error">{{ fieldErrors.email }}</span>
        </label>

        <label class="login-field">
          <span class="login-field__label login-field__label--password">
            Password<span class="login-field__required">*</span>
          </span>
          <span class="login-field__control">
            <input
              v-model="form.password"
              class="login-field__input"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :disabled="submitting"
            />
            <PasswordVisibilityToggle
              class="login-field__toggle"
              :visible="showPassword"
              @toggle="showPassword = !showPassword"
            />
          </span>
          <span v-if="fieldErrors.password" class="login-field__error">{{ fieldErrors.password }}</span>
        </label>

        <button class="login-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg);
  padding: 102px 16px 80px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 17px;
  margin-bottom: 45px;
}

.brand__icon {
  width: 69.33px;
  height: 69.33px;
  flex: none;
}

.brand__name {
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 52px;
  line-height: 79px;
  color: var(--blue-600);
}

.login-card {
  box-sizing: border-box;
  width: 614px;
  min-height: 498px;
  padding: 50px 87px 82px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
}

.login-card__title {
  margin: 0 0 16px;
  text-align: center;
  color: var(--blue-950);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-form__alert {
  padding: 10px 12px;
  border: 1px solid #f1c5cb;
  border-radius: 8px;
  background: #fdecee;
  color: var(--red);
  font-size: var(--body-3-size);
  font-weight: var(--font-weight-regular);
}

.login-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 440px;
}

.login-field__label {
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height);
}

.login-field__label--email {
  color: var(--black);
}

.login-field__label--password {
  color: var(--gray-900);
}

.login-field__required {
  color: var(--red);
}

.login-field__control {
  position: relative;
  width: 100%;
}

.login-field__input {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  font-family: var(--font-family);
  font-weight: var(--font-weight-regular);
  font-size: 1rem;
  line-height: var(--line-height);
  color: var(--text-primary);
}

.login-field__input::placeholder {
  color: var(--gray-700);
}

.login-field__control .login-field__input {
  padding-right: 44px;
}

.login-field__input:focus {
  outline: 2px solid var(--blue-600);
  outline-offset: 1px;
}

.login-field__toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}

.login-field__error {
  color: var(--red);
  font-size: var(--body-4-size);
}

.login-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 440px;
  height: 44px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--blue-600);
  color: var(--white);
  font-size: var(--headline-5-size);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height);
  cursor: pointer;
}

.login-submit:hover:not(:disabled) {
  background: var(--blue-500);
}

.login-submit:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}
</style>
