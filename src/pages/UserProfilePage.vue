<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import SelectDropdown from '@/components/ui/SelectDropdown.vue'
import { icons } from '@/constants/icons'
import { getDistricts, getProvinces, getSubdistricts } from '@/data/thaiAddress'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import type { UserProfile } from '@/types/user'

const auth = useAuthStore()
const profileStore = useProfileStore()

function normalizeProfile(p: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    displayName: p?.displayName ?? '',
    firstName: p?.firstName ?? '',
    lastName: p?.lastName ?? '',
    email: p?.email ?? '',
    phone: p?.phone ?? '',
    address: p?.address ?? '',
    province: p?.province ?? '',
    district: p?.district ?? '',
    subdistrict: p?.subdistrict ?? '',
    avatarUrl: p?.avatarUrl ?? '',
  }
}

const form = reactive<UserProfile>(normalizeProfile(profileStore.profile))
const savedFormState = ref<UserProfile>(normalizeProfile(profileStore.profile))

const fieldErrors = reactive({
  displayName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  province: '',
  district: '',
  subdistrict: '',
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const isSaving = ref(false)
const showSuccessToast = ref(false)
const successMessage = ref('บันทึกข้อมูลผู้ใช้งานสำเร็จเรียบร้อยแล้ว')
const showErrorToast = ref(false)
const errorMessage = ref('')

// Cascading address data
const provinces = computed(() => getProvinces())
const districts = computed(() => (form.province ? getDistricts(form.province) : []))
const subdistricts = computed(() =>
  form.province && form.district ? getSubdistricts(form.province, form.district) : [],
)

function onProvinceChange(newProvince: string) {
  form.province = newProvince
  fieldErrors.province = ''
  // Reset district and subdistrict when province changes
  const availableDistricts = getDistricts(newProvince)
  if (!availableDistricts.includes(form.district)) {
    form.district = ''
    form.subdistrict = ''
  }
}

function onDistrictChange(newDistrict: string) {
  form.district = newDistrict
  fieldErrors.district = ''
  // Reset subdistrict when district changes
  const availableSubdistricts = getSubdistricts(form.province, newDistrict)
  if (!availableSubdistricts.includes(form.subdistrict)) {
    form.subdistrict = ''
  }
}

function onSubdistrictChange(newSubdistrict: string) {
  form.subdistrict = newSubdistrict
  fieldErrors.subdistrict = ''
}

// Avatar upload handling
function triggerFileInput() {
  uploadError.value = ''
  fileInputRef.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadError.value = ''

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WEBP) เท่านั้น'
    target.value = ''
    return
  }

  const maxSizeBytes = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSizeBytes) {
    uploadError.value = 'ขนาดไฟล์เกิน 5 MB กรุณาเลือกไฟล์ใหม่'
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (typeof e.target?.result === 'string') {
      form.avatarUrl = e.target.result
    }
  }
  reader.readAsDataURL(file)
}

const userInitials = computed(() => {
  if (form.displayName?.trim()) {
    return form.displayName.trim().charAt(0).toUpperCase()
  }
  if (form.firstName?.trim()) {
    return form.firstName.trim().charAt(0).toUpperCase()
  }
  return 'V'
})

// Validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9]{9,10}$/

function validate(): boolean {
  let isValid = true

  fieldErrors.displayName = ''
  fieldErrors.firstName = ''
  fieldErrors.lastName = ''
  fieldErrors.email = ''
  fieldErrors.phone = ''
  fieldErrors.address = ''
  fieldErrors.province = ''
  fieldErrors.district = ''
  fieldErrors.displayName = ''
  fieldErrors.firstName = ''
  fieldErrors.lastName = ''
  fieldErrors.email = ''
  fieldErrors.phone = ''
  fieldErrors.address = ''
  fieldErrors.province = ''
  fieldErrors.district = ''
  fieldErrors.subdistrict = ''

  if (!(form.displayName || '').trim()) {
    fieldErrors.displayName = 'กรุณากรอกชื่อที่แสดง'
    isValid = false
  }

  if (!(form.firstName || '').trim()) {
    fieldErrors.firstName = 'กรุณากรอกชื่อจริง'
    isValid = false
  }

  if (!(form.lastName || '').trim()) {
    fieldErrors.lastName = 'กรุณากรอกนามสกุล'
    isValid = false
  }

  const cleanEmail = (form.email || '').trim()
  if (!cleanEmail) {
    fieldErrors.email = 'กรุณากรอกอีเมล'
    isValid = false
  } else if (!EMAIL_REGEX.test(cleanEmail)) {
    fieldErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    isValid = false
  }

  const cleanPhone = (form.phone || '').replace(/[-\s]/g, '')
  if (!cleanPhone) {
    fieldErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    isValid = false
  } else if (!PHONE_REGEX.test(cleanPhone)) {
    fieldErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก'
    isValid = false
  }

  if (!(form.address || '').trim()) {
    fieldErrors.address = 'กรุณากรอกที่อยู่'
    isValid = false
  }

  if (!(form.province || '').trim()) {
    fieldErrors.province = 'กรุณาเลือกจังหวัด'
    isValid = false
  }

  if (!(form.district || '').trim()) {
    fieldErrors.district = 'กรุณาเลือกเขต / อำเภอ'
    isValid = false
  }

  if (!(form.subdistrict || '').trim()) {
    fieldErrors.subdistrict = 'กรุณาเลือกแขวง / ตำบล'
    isValid = false
  }

  return isValid
}

async function handleSave() {
  if (!validate()) {
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  showErrorToast.value = false
  try {
    const saved = await profileStore.saveProfile({
      displayName: (form.displayName || '').trim(),
      firstName: (form.firstName || '').trim(),
      lastName: (form.lastName || '').trim(),
      email: (form.email || '').trim(),
      phone: (form.phone || '').trim(),
      address: (form.address || '').trim(),
      subdistrict: (form.subdistrict || '').trim(),
      district: (form.district || '').trim(),
      province: (form.province || '').trim(),
      avatarUrl: form.avatarUrl,
    })

    const cleanSaved = normalizeProfile(saved)
    Object.assign(form, cleanSaved)
    savedFormState.value = { ...cleanSaved }

    // Also keep auth store synced if logged in
    if (auth.user) {
      auth.user.displayName = form.displayName
      auth.user.firstName = form.firstName
      auth.user.lastName = form.lastName
      auth.user.email = form.email
      auth.user.phone = form.phone
      auth.user.address = `${form.address} ${form.subdistrict} ${form.district} ${form.province}`.trim()
      auth.user.avatarUrl = form.avatarUrl
    }

    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 4000)
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง'
    errorMessage.value = msg
    showErrorToast.value = true
    setTimeout(() => {
      showErrorToast.value = false
    }, 5000)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  // Reset form to last saved state
  Object.assign(form, savedFormState.value)
  uploadError.value = ''
  fieldErrors.displayName = ''
  fieldErrors.firstName = ''
  fieldErrors.lastName = ''
  fieldErrors.email = ''
  fieldErrors.phone = ''
  fieldErrors.address = ''
  fieldErrors.province = ''
  fieldErrors.district = ''
  fieldErrors.subdistrict = ''
}

onMounted(async () => {
  const loaded = await profileStore.loadProfile()
  const clean = normalizeProfile(loaded)
  Object.assign(form, clean)
  savedFormState.value = { ...clean }

  // If auth.user exists, prefill from auth store if profile was not yet set
  if (auth.user) {
    if (!form.displayName) form.displayName = auth.user.displayName || auth.user.fullName || ''
    if (!form.firstName) form.firstName = auth.user.firstName || ''
    if (!form.lastName) form.lastName = auth.user.lastName || ''
    if (!form.email) form.email = auth.user.email || ''
    if (!form.phone) form.phone = auth.user.phone || ''
    if (!form.avatarUrl && auth.user.avatarUrl) {
      form.avatarUrl = auth.user.avatarUrl
    }
    savedFormState.value = { ...form }
  }
})
</script>

<template>
  <div class="user-profile-page">
    <TheHeader />

    <!-- Success Toast Notification -->
    <transition name="toast-fade">
      <div v-if="showSuccessToast" class="profile-toast" role="status">
        <div class="profile-toast__icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="profile-toast__message">{{ successMessage }}</span>
        <button type="button" class="profile-toast__close" aria-label="ปิดแจ้งเตือน" @click="showSuccessToast = false">
          &times;
        </button>
      </div>
    </transition>

    <!-- Error Toast Notification -->
    <transition name="toast-fade">
      <div v-if="showErrorToast" class="profile-toast profile-toast--error" role="alert">
        <div class="profile-toast__icon-wrap profile-toast__icon-wrap--error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <span class="profile-toast__message">{{ errorMessage }}</span>
        <button type="button" class="profile-toast__close" aria-label="ปิดแจ้งเตือน" @click="showErrorToast = false">
          &times;
        </button>
      </div>
    </transition>

    <main class="profile-container">
      <div class="profile-layout">
        <!-- Sidebar Navigation -->
        <aside class="profile-sidebar" aria-label="เมนูบัญชีผู้ใช้">
          <div class="sidebar-card">
            <h2 class="sidebar-card__title">บัญชีผู้ใช้</h2>
            <nav class="sidebar-nav">
              <a href="/profile" class="sidebar-nav__item sidebar-nav__item--active" aria-current="page">
                <span class="sidebar-nav__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7Z" />
                    <path d="M12 14C10.1435 14 8.36301 14.7375 7.05025 16.0503C5.7375 17.363 5 19.1435 5 21H19C19 19.1435 18.2625 17.363 16.9497 16.0503C15.637 14.7375 13.8565 14 12 14Z" />
                  </svg>
                </span>
                <span class="sidebar-nav__text">ข้อมูลผู้ใช้งาน</span>
              </a>

              <a href="#reset-password" class="sidebar-nav__item" @click.prevent>
                <span class="sidebar-nav__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span class="sidebar-nav__text">รีเซ็ตรหัสผ่าน</span>
              </a>

              <a href="#repair-orders" class="sidebar-nav__item" @click.prevent>
                <span class="sidebar-nav__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" />
                    <path d="M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5" />
                    <line x1="12" y1="12" x2="16" y2="12" />
                    <line x1="12" y1="16" x2="16" y2="16" />
                  </svg>
                </span>
                <span class="sidebar-nav__text">รายการคำสั่งซ่อม</span>
              </a>

              <a href="#repair-history" class="sidebar-nav__item" @click.prevent>
                <span class="sidebar-nav__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span class="sidebar-nav__text">ประวัติการซ่อม</span>
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Form Card -->
        <section class="profile-content" aria-labelledby="profile-heading">
          <div class="main-card">
            <header class="main-card__header">
              <h1 id="profile-heading" class="main-card__title">ข้อมูลผู้ใช้งาน</h1>
            </header>

            <!-- Avatar Section -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  :alt="form.displayName"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  {{ userInitials }}
                </div>
              </div>

              <div class="avatar-actions">
                <button
                  type="button"
                  class="btn-upload"
                  @click="triggerFileInput"
                >
                  <img :src="icons.action.imageAdd" alt="" width="20" height="20" class="btn-upload__icon" />
                  <span>Upload profile image</span>
                </button>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  class="visually-hidden"
                  @change="handleFileUpload"
                />
                <p class="avatar-hint">
                  ขนาดไฟล์ที่แนะนำ 1:1 หรือไม่เกิน 5 MB รองรับไฟล์ PNG, JPG, GIF, WEBP
                </p>
                <p v-if="uploadError" class="avatar-error" role="alert">
                  {{ uploadError }}
                </p>
              </div>
            </div>

            <hr class="profile-divider" />

            <!-- User Information Form -->
            <form class="profile-form" @submit.prevent="handleSave">
              <div class="form-grid">
                <!-- 1. Display Name (Full row or col 1) -->
                <div class="form-group form-group--half">
                  <label for="displayName" class="form-label">
                    ชื่อที่แสดง<span class="required">*</span>
                  </label>
                  <input
                    id="displayName"
                    v-model="form.displayName"
                    type="text"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.displayName }"
                    placeholder="กรุณากรอกชื่อที่แสดง"
                    @input="fieldErrors.displayName = ''"
                  />
                  <span v-if="fieldErrors.displayName" class="field-error">{{ fieldErrors.displayName }}</span>
                </div>

                <div class="form-group form-group--half form-group--empty-spacer"></div>

                <!-- 2. First Name & 3. Last Name -->
                <div class="form-group form-group--half">
                  <label for="firstName" class="form-label">
                    ชื่อจริง<span class="required">*</span>
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.firstName }"
                    placeholder="กรุณากรอกชื่อจริง"
                    @input="fieldErrors.firstName = ''"
                  />
                  <span v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</span>
                </div>

                <div class="form-group form-group--half">
                  <label for="lastName" class="form-label">
                    นามสกุล<span class="required">*</span>
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.lastName }"
                    placeholder="กรุณากรอกนามสกุล"
                    @input="fieldErrors.lastName = ''"
                  />
                  <span v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</span>
                </div>

                <!-- 4. Email & 5. Phone -->
                <div class="form-group form-group--half">
                  <label for="email" class="form-label">
                    อีเมล<span class="required">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.email }"
                    placeholder="example@mail.com"
                    @input="fieldErrors.email = ''"
                  />
                  <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
                </div>

                <div class="form-group form-group--half">
                  <label for="phone" class="form-label">
                    เบอร์โทรศัพท์<span class="required">*</span>
                  </label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.phone }"
                    placeholder="08xxxxxxxx"
                    @input="fieldErrors.phone = ''"
                  />
                  <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
                </div>

                <!-- 6. Address Fields - 2 columns (Row 1: Address left | Province right) -->
                <div class="form-group form-group--half">
                  <label for="address" class="form-label">
                    ที่อยู่<span class="required">*</span>
                  </label>
                  <input
                    id="address"
                    v-model="form.address"
                    type="text"
                    class="form-input"
                    :class="{ 'form-input--error': fieldErrors.address }"
                    placeholder="กรุณากรอกที่อยู่ (บ้านเลขที่, ซอย, ถนน)"
                    @input="fieldErrors.address = ''"
                  />
                  <span v-if="fieldErrors.address" class="field-error">{{ fieldErrors.address }}</span>
                </div>

                <div class="form-group form-group--half">
                  <label class="form-label">
                    จังหวัด<span class="required">*</span>
                  </label>
                  <SelectDropdown
                    v-model="form.province"
                    :options="provinces"
                    placeholder="เลือกจังหวัด"
                    :has-error="Boolean(fieldErrors.province)"
                    @change="onProvinceChange"
                  />
                  <span v-if="fieldErrors.province" class="field-error">{{ fieldErrors.province }}</span>
                </div>

                <!-- Address Fields - Row 2: District left | Subdistrict right -->
                <div class="form-group form-group--half">
                  <label class="form-label">
                    เขต / อำเภอ<span class="required">*</span>
                  </label>
                  <SelectDropdown
                    v-model="form.district"
                    :options="districts"
                    :disabled="!form.province"
                    :placeholder="form.province ? 'เลือกเขต / อำเภอ' : 'กรุณาเลือกจังหวัดก่อน'"
                    :has-error="Boolean(fieldErrors.district)"
                    @change="onDistrictChange"
                  />
                  <span v-if="fieldErrors.district" class="field-error">{{ fieldErrors.district }}</span>
                </div>

                <div class="form-group form-group--half">
                  <label class="form-label">
                    แขวง / ตำบล<span class="required">*</span>
                  </label>
                  <SelectDropdown
                    v-model="form.subdistrict"
                    :options="subdistricts"
                    :disabled="!form.district"
                    :placeholder="form.district ? 'เลือกแขวง / ตำบล' : 'กรุณาเลือกเขต / อำเภอก่อน'"
                    :has-error="Boolean(fieldErrors.subdistrict)"
                    @change="onSubdistrictChange"
                  />
                  <span v-if="fieldErrors.subdistrict" class="field-error">{{ fieldErrors.subdistrict }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button
                  type="button"
                  class="btn-cancel"
                  :disabled="isSaving"
                  @click="handleCancel"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="btn-save"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving" class="spinner"></span>
                  {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.user-profile-page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.profile-container {
  flex: 1;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem 4rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
}

/* Sidebar */
.profile-sidebar {
  width: 100%;
}

.sidebar-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 1.5rem 1rem;
}

.sidebar-card__title {
  margin: 0 0 1rem;
  padding: 0 0.75rem;
  font-family: var(--font-family);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0.875rem;
  border-radius: 8px;
  text-decoration: none;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--gray-700);
  transition: all 0.15s ease;
}

.sidebar-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--gray-500);
}

.sidebar-nav__item:hover:not(.sidebar-nav__item--active) {
  background: var(--gray-100);
  color: var(--gray-900);
}

.sidebar-nav__item--active {
  background: var(--blue-100);
  color: var(--blue-600);
  font-weight: 500;
}

.sidebar-nav__item--active .sidebar-nav__icon {
  color: var(--blue-600);
}

/* Main Card */
.profile-content {
  min-width: 0;
}

.main-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  padding: 2.5rem;
}

.main-card__header {
  margin-bottom: 2rem;
}

.main-card__title {
  margin: 0;
  font-family: var(--font-family);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-950);
}

/* Avatar Section */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  position: relative;
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--blue-100);
  color: var(--blue-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-size: 2rem;
  font-weight: 600;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  height: 40px;
  padding: 0 1.25rem;
  background: var(--white);
  border: 1px solid var(--blue-600);
  border-radius: 8px;
  color: var(--blue-600);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upload:hover {
  background: var(--blue-100);
}

.btn-upload__icon {
  filter: invert(34%) sepia(87%) saturate(2243%) hue-rotate(211deg) brightness(98%) contrast(97%);
}

.avatar-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--gray-600);
  line-height: 1.4;
}

.avatar-error {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--red);
  font-weight: 500;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.profile-divider {
  border: none;
  border-top: 1px solid var(--gray-200);
  margin: 0 0 2rem;
}

/* Form Styles */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.form-group--half {
  grid-column: span 1;
}

.form-label {
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--gray-900);
}

.required {
  color: var(--red);
  margin-left: 2px;
}

.form-input {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 400;
  color: var(--gray-900);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input:hover:not(:disabled) {
  border-color: var(--gray-400);
}

.form-input:focus {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 1px var(--blue-600);
}

.form-input--error {
  border-color: var(--red) !important;
}

.field-error {
  font-size: 0.75rem;
  color: var(--red);
  margin-top: 2px;
}

/* Actions */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-100);
}

.btn-cancel {
  min-width: 110px;
  height: 44px;
  padding: 0 1.5rem;
  background: var(--white);
  border: 1px solid var(--blue-600);
  border-radius: 8px;
  color: var(--blue-600);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: var(--blue-100);
}

.btn-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 140px;
  height: 44px;
  padding: 0 1.75rem;
  background: var(--blue-600);
  border: none;
  border-radius: 8px;
  color: var(--white);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-save:hover:not(:disabled) {
  background: var(--blue-500);
}

.btn-save:disabled,
.btn-cancel:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toast */
.profile-toast {
  position: fixed;
  top: 96px;
  right: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 12px 18px;
  background: var(--white);
  border: 1px solid #c3e6cb;
  border-left: 4px solid #28a745;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  color: var(--gray-900);
  font-family: var(--font-family);
  font-size: 0.9375rem;
}

.profile-toast--error {
  border-color: #f5c6cb;
  border-left-color: #dc3545;
}

.profile-toast__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8f5e9;
  color: #28a745;
}

.profile-toast__icon-wrap--error {
  background: #fde8e8;
  color: #dc3545;
}

.profile-toast__close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0 4px;
  margin-left: 0.5rem;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Responsive */
@media (max-width: 960px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .main-card {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .form-group--half {
    grid-column: span 1;
  }

  .form-group--empty-spacer {
    display: none;
  }
}

@media (max-width: 576px) {
  .profile-container {
    padding: 1.25rem 1rem 2.5rem;
  }

  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }

  .profile-toast {
    left: 16px;
    right: 16px;
    top: 76px;
  }
}
</style>
