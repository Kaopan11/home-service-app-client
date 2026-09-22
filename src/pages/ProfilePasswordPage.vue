<script setup lang="ts">
import { reactive, ref } from 'vue'
import PasswordVisibilityToggle from '@/components/auth/PasswordVisibilityToggle.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import { changePassword, validateChangePassword } from '@/services/passwordApi'
import { isApiError } from '@/types/auth'
import type { ChangePasswordInput, PasswordField } from '@/types/password'

const form = reactive<ChangePasswordInput>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})
const visible = reactive({
  currentPassword: false,
  newPassword: false,
  confirmNewPassword: false,
})
const fieldErrors = reactive<Partial<Record<PasswordField, string>>>({})
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)

const fields: { key: PasswordField; label: string; autocomplete: string }[] = [
  { key: 'currentPassword', label: 'รหัสผ่านปัจจุบัน', autocomplete: 'current-password' },
  { key: 'newPassword', label: 'รหัสผ่านใหม่', autocomplete: 'new-password' },
  { key: 'confirmNewPassword', label: 'ยืนยันรหัสผ่านใหม่', autocomplete: 'new-password' },
]

function applyApiErrors(error: { code?: string; message: string; errors?: { field: string; message: string }[] }): void {
  if (error.code === 'PASSWORD_UPDATE_FAILED') {
    formError.value = error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
    return
  }
  if (error.code === 'CURRENT_PASSWORD_INVALID') {
    fieldErrors.currentPassword = error.errors?.[0]?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
    return
  }
  for (const item of error.errors ?? []) {
    if (item.field === 'currentPassword' || item.field === 'newPassword' || item.field === 'confirmNewPassword') {
      fieldErrors[item.field] = item.message
    }
  }
  if (!error.errors?.length) {
    formError.value = error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
  }
}

async function handleSubmit(): Promise<void> {
  successMessage.value = ''
  formError.value = ''
  fieldErrors.currentPassword = ''
  fieldErrors.newPassword = ''
  fieldErrors.confirmNewPassword = ''

  const local = validateChangePassword(form)
  if (Object.keys(local).length) {
    Object.assign(fieldErrors, local)
    return
  }

  submitting.value = true
  try {
    successMessage.value = await changePassword({ ...form })
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmNewPassword = ''
  } catch (error) {
    if (isApiError(error) && error.status !== 401) {
      applyApiErrors(error)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <TheHeader />
    <div class="banner">รีเซ็ตรหัสผ่าน</div>
    <main class="container">
      <div class="layout">
        <aside class="sidebar" aria-label="เมนูบัญชีผู้ใช้">
          <h2>บัญชีผู้ใช้</h2>
          <nav>
            <RouterLink :to="{ name: 'user-profile' }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                <path d="M5 21a7 7 0 0 1 14 0" />
              </svg>
              ข้อมูลผู้ใช้งาน
            </RouterLink>
            <RouterLink class="active" :to="{ name: 'profile-password' }" aria-current="page">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              รีเซ็ตรหัสผ่าน
            </RouterLink>
            <a href="#repair-orders" @click.prevent>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M8 4h8v3H8z" />
                <path d="M7 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                <path d="M9 13h6M9 17h4" />
              </svg>
              รายการคำสั่งซ่อม
            </a>
            <a href="#repair-history" @click.prevent>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v5l3 2" />
              </svg>
              ประวัติการซ่อม
            </a>
          </nav>
        </aside>

        <section class="sheet">
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
          <form @submit.prevent="handleSubmit">
            <div v-for="field in fields" :key="field.key" class="row">
              <label :for="field.key">{{ field.label }}<span>*</span></label>
              <div class="control">
                <input
                  :id="field.key"
                  v-model="form[field.key]"
                  :type="visible[field.key] ? 'text' : 'password'"
                  :name="field.key"
                  :autocomplete="field.autocomplete"
                />
                <PasswordVisibilityToggle
                  :visible="visible[field.key]"
                  @toggle="visible[field.key] = !visible[field.key]"
                />
                <p v-if="fieldErrors[field.key]" class="field-error">{{ fieldErrors[field.key] }}</p>
              </div>
            </div>
            <div class="actions">
              <button type="submit" :disabled="submitting">{{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
            </div>
          </form>
        </section>
      </div>
    </main>
    <div v-if="successMessage" class="toast" role="status">{{ successMessage }}</div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100svh;
  background: #f3f4f6;
}

.banner {
  background: #3366ff;
  color: #fff;
  text-align: center;
  font-size: 28px;
  font-weight: 500;
  line-height: 1.4;
  padding: 36px 16px;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  width: 100%;
}

.sidebar {
  background: #fff;
  border: 1px solid #e6e7eb;
  border-radius: 12px;
  padding: 20px 12px;
  box-shadow: 0 1px 2px rgb(23 51 106 / 0.04);
}

.sidebar h2 {
  margin: 0 0 8px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #646c80;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar a {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #4b5160;
  text-decoration: none;
}

.sidebar a svg {
  flex-shrink: 0;
  color: #9aa1b0;
}

.sidebar a.active {
  background: #e8f1ff;
  color: #3366ff;
  font-weight: 500;
}

.sidebar a.active svg {
  color: #3366ff;
}

.sheet {
  min-width: 0;
  width: 100%;
  max-width: none;
  background: #fff;
  border: 1px solid #e6e7eb;
  border-radius: 12px;
  padding: 36px 40px 28px;
}

.sheet form {
  width: 100%;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  padding: 12px 18px;
  background: #fff;
  border: 1px solid #c3e6cb;
  border-left: 4px solid #28a745;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  color: #323640;
}

.form-error,
.field-error {
  margin: 8px 0 0;
  color: #c82438;
  font-size: 14px;
}

.row {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  margin-bottom: 22px;
}

.row label {
  color: #4b5160;
  font-size: 16px;
}

.row label span {
  color: #c82438;
}

.control {
  position: relative;
  min-width: 0;
  width: 100%;
}

.control input {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 44px 0 16px;
  border: 1px solid #d5d8e0;
  border-radius: 8px;
  background: #fff;
  color: #232630;
  font: inherit;
}

.control :deep(.password-toggle) {
  position: absolute;
  top: 10px;
  right: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.actions button {
  min-width: 96px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 8px;
  background: #3366ff;
  color: #fff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.actions button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

@media (min-width: 801px) {
  .layout {
    grid-template-columns: 250px minmax(0, 1fr);
    align-items: start;
  }
}

@media (max-width: 800px) {
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .row label {
    padding-top: 0;
  }
}
</style>
