<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import AlertConfirmation from '@/components/admin/AlertConfirmation.vue'
import { icons } from '@/constants/icons'
import { formatAdminDateTime } from '@/data/adminServices'
import { listCategories } from '@/services/categoryApi'
import { createAdminService, deleteAdminService, getAdminService, updateAdminService } from '@/services/adminServices'
import type { CategoryDto } from '@/types/category'

type ServiceOptionForm = {
  key: number
  name: string
  price: string
  unit: string
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'admin-service-edit')
const serviceId = computed(() => Number(route.params.id))

const name = ref('')
const categoryId = ref<number | null>(null)
const imageUrl = ref('')
const imageError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const optionsSection = ref<HTMLElement | null>(null)
const options = ref<ServiceOptionForm[]>([newOption(1), newOption(2)])
const nextOptionKey = ref(3)
const draggingOptionKey = ref<number | null>(null)
const categories = ref<CategoryDto[]>([])
const loading = ref(true)
const submitting = ref(false)
const deleting = ref(false)
const showDelete = ref(false)
const createdAt = ref('')
const updatedAt = ref('')
const error = ref('')

function optionIsBlank(option: ServiceOptionForm): boolean {
  return !option.name.trim() && !option.unit.trim() && option.price.trim() === ''
}

function optionIsComplete(option: ServiceOptionForm): boolean {
  return (
    Boolean(option.name.trim()) &&
    Boolean(option.unit.trim()) &&
    Number.isFinite(Number(option.price)) &&
    Number(option.price) > 0
  )
}

const filledOptions = computed(() => options.value.filter((option) => !optionIsBlank(option)))

const optionsValid = computed(
  () => filledOptions.value.length > 0 && filledOptions.value.every(optionIsComplete),
)

const categorySelected = computed(() => {
  const id = Number(categoryId.value)
  return Number.isInteger(id) && id > 0
})

const missingHint = computed(() => {
  if (!name.value.trim()) {
    return 'กรุณากรอกชื่อบริการ'
  }
  if (!categorySelected.value) {
    return 'กรุณาเลือกหมวดหมู่'
  }
  if (!imageUrl.value) {
    return 'กรุณาอัปโหลดรูปภาพก่อนกดยืนยัน'
  }
  if (!optionsValid.value) {
    return 'กรุณากรอกรายการบริการย่อยอย่างน้อย 1 รายการ (ชื่อ ราคา และหน่วย)'
  }
  return ''
})

onMounted(async () => {
  try {
    categories.value = await listCategories()
    if (isEdit.value) {
      const item = await getAdminService(serviceId.value)
      name.value = item.name
      const loadedCategoryId = Number(item.categoryId)
      categoryId.value =
        Number.isInteger(loadedCategoryId) && loadedCategoryId > 0 ? loadedCategoryId : null
      imageUrl.value = item.imageUrl ?? ''
      createdAt.value = item.createdAt
      updatedAt.value = item.updatedAt
      if (item.options?.length) {
        options.value = item.options.map((option, index) => ({
          key: index + 1,
          name: option.name ?? '',
          price: option.price == null ? '' : String(option.price),
          unit: option.unit ?? '',
        }))
        nextOptionKey.value = item.options.length + 1
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลได้'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(): Promise<void> {
  if (missingHint.value) {
    error.value = missingHint.value
    if (!optionsValid.value) {
      optionsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return
  }
  const selectedCategoryId = Number(categoryId.value)
  if (!Number.isInteger(selectedCategoryId) || selectedCategoryId <= 0) {
    error.value = 'กรุณาเลือกหมวดหมู่'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const payload = {
      name: name.value.trim(),
      categoryId: selectedCategoryId,
      imageUrl: imageUrl.value,
      options: filledOptions.value.map((option, index) => ({
        name: option.name.trim(),
        price: Number(option.price),
        unit: option.unit.trim(),
        display_order: index + 1,
      })),
    }
    if (isEdit.value) {
      await updateAdminService(serviceId.value, payload)
    } else {
      await createAdminService(payload)
    }
    await router.push({ name: 'admin-services' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถบันทึกบริการได้'
  } finally {
    submitting.value = false
  }
}

function newOption(key = 1): ServiceOptionForm {
  return { key, name: '', price: '', unit: '' }
}

function addOption(): void {
  options.value.push(newOption(nextOptionKey.value++))
}

function removeOption(key: number): void {
  if (options.value.length > 1) {
    options.value = options.value.filter((option) => option.key !== key)
  }
}

function onOptionDragStart(key: number, event: DragEvent): void {
  if (!(event.target as HTMLElement | null)?.closest('.drag-handle')) {
    event.preventDefault()
    return
  }
  draggingOptionKey.value = key
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onOptionDrop(targetKey: number): void {
  const sourceKey = draggingOptionKey.value
  draggingOptionKey.value = null
  if (sourceKey === null || sourceKey === targetKey) {
    return
  }
  const fromIndex = options.value.findIndex((option) => option.key === sourceKey)
  const toIndex = options.value.findIndex((option) => option.key === targetKey)
  if (fromIndex < 0 || toIndex < 0) {
    return
  }
  const next = [...options.value]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  options.value = next
}

function selectImage(): void {
  fileInput.value?.click()
}

function handleImageInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    loadImage(file)
  }
  input.value = ''
}

function handleImageDrop(event: DragEvent): void {
  const file = event.dataTransfer?.files[0]
  if (file) {
    loadImage(file)
  }
}

function loadImage(file: File): void {
  imageError.value = ''
  const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  if (!['image/png', 'image/jpeg'].includes(type)) {
    imageError.value = 'รองรับเฉพาะไฟล์ PNG และ JPG'
    return
  }
  if (file.size > MAX_IMAGE_BYTES) {
    imageError.value = 'ขนาดไฟล์ต้องไม่เกิน 5MB'
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      imageError.value = 'ไม่สามารถอ่านไฟล์รูปภาพได้'
      return
    }
    void compressImage(reader.result, type).then((dataUrl) => {
      imageUrl.value = dataUrl
    }).catch(() => {
      imageError.value = 'ไม่สามารถอ่านไฟล์รูปภาพได้'
    })
  }
  reader.onerror = () => {
    imageError.value = 'ไม่สามารถอ่านไฟล์รูปภาพได้'
  }
  reader.readAsDataURL(file)
}

function compressImage(src: string, mime: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const maxWidth = 1440
      const scale = Math.min(1, maxWidth / image.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('canvas'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const outType = mime === 'image/png' ? 'image/png' : 'image/jpeg'
      let quality = 0.82
      let dataUrl = canvas.toDataURL(outType, quality)
      while (dataUrl.length > 2_000_000 && quality > 0.4 && outType === 'image/jpeg') {
        quality -= 0.1
        dataUrl = canvas.toDataURL(outType, quality)
      }
      if (dataUrl.length > 2_000_000 && outType === 'image/png') {
        dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      }
      resolve(dataUrl)
    }
    image.onerror = () => reject(new Error('image'))
    image.src = src
  })
}

async function confirmDelete(): Promise<void> {
  if (!isEdit.value) {
    return
  }
  deleting.value = true
  error.value = ''
  try {
    await deleteAdminService(serviceId.value)
    await router.push({ name: 'admin-services' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถลบบริการได้'
  } finally {
    deleting.value = false
    showDelete.value = false
  }
}
</script>

<template>
  <AdminLayout active="services">
    <template #topbar>
      <h1 v-if="!isEdit" class="page-title page-title--add">เพิ่มบริการ</h1>
      <div v-else class="heading-wrap">
        <button type="button" class="back" aria-label="กลับ" @click="router.push({ name: 'admin-services' })">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 5L8.5 12L14.5 19"
              stroke="#646C80"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="heading">
          <p class="crumb">บริการ</p>
          <h1 class="page-title">{{ name || 'แก้ไขบริการ' }}</h1>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn btn--secondary" @click="router.push({ name: 'admin-services' })">
          ยกเลิก
        </button>
        <button type="button" class="btn btn--primary" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? 'กำลังบันทึก...' : isEdit ? 'ยืนยัน' : 'สร้าง' }}
        </button>
      </div>
    </template>

    <p v-if="loading" class="status">กำลังโหลดข้อมูล...</p>
    <form v-else class="service-form" @submit.prevent="handleSubmit">
      <p v-if="error || missingHint" class="status status--error">{{ error || missingHint }}</p>
      <div class="row">
        <label class="label" for="service-name">ชื่อบริการ<span>*</span></label>
        <input id="service-name" v-model="name" class="input" type="text" maxlength="255" />
      </div>
      <div class="row">
        <label class="label" for="service-category">หมวดหมู่<span>*</span></label>
        <select id="service-category" v-model.number="categoryId" class="input">
          <option :value="null" disabled>เลือกหมวดหมู่</option>
          <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="row row--image">
        <span class="label">รูปภาพ<span>*</span></span>
        <div class="image-field">
          <input
            ref="fileInput"
            class="file-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
            @change="handleImageInput"
          />
          <div
            v-if="!imageUrl"
            class="image-dropzone"
            role="button"
            tabindex="0"
            @click="selectImage"
            @keydown.enter.prevent="selectImage"
            @keydown.space.prevent="selectImage"
            @dragover.prevent
            @drop.prevent="handleImageDrop"
          >
            <img :src="icons.action.imageAdd" width="48" height="48" alt="" />
            <p><button type="button" @click.stop="selectImage">อัพโหลดรูปภาพ</button> หรือ ลากและวางที่นี่</p>
            <small>PNG, JPG ขนาดไม่เกิน 5MB</small>
          </div>
          <div v-else class="image-preview">
            <img :src="imageUrl" alt="ตัวอย่างรูปบริการ" />
            <div class="image-preview__meta">
              <small class="image-hint">ขนาดภาพที่แนะนำ: 1440 × 225 PX</small>
              <button type="button" @click="imageUrl = ''">ลบรูปภาพ</button>
            </div>
          </div>
          <small v-if="!imageUrl" class="image-hint">ขนาดภาพที่แนะนำ: 1440 × 225 PX</small>
          <p v-if="imageError" class="field-error">{{ imageError }}</p>
        </div>
      </div>

      <div class="divider" />
      <h2 class="section-title">รายการบริการย่อย</h2>
      <div ref="optionsSection" class="options">
        <div
          v-for="(option, index) in options"
          :key="option.key"
          class="option-row"
          :class="{ 'option-row--dragging': draggingOptionKey === option.key }"
          @dragstart="onOptionDragStart(option.key, $event)"
          @dragend="draggingOptionKey = null"
          @dragover.prevent
          @drop.prevent="onOptionDrop(option.key)"
        >
          <img
            class="drag-handle"
            :src="icons.admin.drag"
            width="20"
            height="20"
            alt="ลากเพื่อเรียงลำดับ"
            draggable="true"
          />
          <div class="option-fields">
            <label class="option-field option-field--name">
              <span>ชื่อรายการ<span v-if="index === 0">*</span></span>
              <input v-model="option.name" type="text" maxlength="255" />
            </label>
            <template v-if="isEdit">
              <label class="option-field">
                <span>หน่วยการบริการ<span v-if="index === 0">*</span></span>
                <input v-model="option.unit" type="text" maxlength="255" />
              </label>
              <label class="option-field">
                <span>ค่าบริการ / 1 หน่วย<span v-if="index === 0">*</span></span>
                <span class="price-input">
                  <input v-model="option.price" type="number" min="0.01" step="0.01" />
                  <span>฿</span>
                </span>
              </label>
            </template>
            <template v-else>
              <label class="option-field">
                <span>ค่าบริการ / 1 หน่วย</span>
                <span class="price-input">
                  <input v-model="option.price" type="number" min="0.01" step="0.01" />
                  <span>฿</span>
                </span>
              </label>
              <label class="option-field">
                <span>หน่วยการบริการ</span>
                <input v-model="option.unit" type="text" maxlength="255" />
              </label>
            </template>
          </div>
          <button
            type="button"
            class="remove-option"
            :disabled="options.length === 1"
            @click="removeOption(option.key)"
          >
            ลบรายการ
          </button>
        </div>
      </div>
      <button type="button" class="add-option" @click="addOption">
        เพิ่มรายการ
        <img :src="icons.admin.plus" width="20" height="20" alt="" />
      </button>
      <template v-if="isEdit">
        <div class="divider" />
        <div class="meta">
          <div class="row">
            <span class="label">สร้างเมื่อ</span>
            <span class="meta-value">{{ formatAdminDateTime(createdAt) }}</span>
          </div>
          <div class="row">
            <span class="label">แก้ไขล่าสุด</span>
            <span class="meta-value">{{ formatAdminDateTime(updatedAt) }}</span>
          </div>
        </div>
      </template>
    </form>
    <div v-if="isEdit && !loading" class="delete-wrap">
      <button type="button" class="delete-link" @click="showDelete = true">
        <img :src="icons.admin.trash" width="24" height="24" alt="" />
        ลบบริการ
      </button>
    </div>
    <AlertConfirmation
      :open="showDelete"
      :item-name="name"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
  </AdminLayout>
</template>

<style scoped>
.heading-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}

.back {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 48px;
}

.crumb {
  margin: 0;
  height: 18px;
  color: #646c80;
  font-size: 12px;
  font-weight: 400;
  line-height: 150%;
}

.page-title {
  margin: 0;
  height: 30px;
  color: #232630;
  font-size: 20px;
  font-weight: 500;
  line-height: 150%;
}

.page-title--add {
  flex: 1;
}

.topbar-actions {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  width: 248px;
}

.btn {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 112px;
  height: 44px;
  padding: 10px 24px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
  cursor: pointer;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn--primary {
  border: none;
  background: #336df2;
  color: #ffffff;
}

.btn--secondary {
  border: 1px solid #336df2;
  background: #ffffff;
  color: #336df2;
}

.status {
  margin: 0 0 16px;
  color: #646c80;
}

.status--error {
  color: #c82438;
}

.service-form {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 1120px;
  max-width: 100%;
  margin-top: 16px;
  padding: 40px 24px;
  gap: 40px;
  overflow: visible;
  background: #ffffff;
  border: 1px solid #e6e7eb;
  border-radius: 8px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  height: 44px;
  width: 662px;
}

.label {
  width: 205px;
  height: 24px;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
}

.label span {
  color: #c82438;
}

.input {
  box-sizing: border-box;
  width: 433px;
  height: 44px;
  padding: 10px 16px;
  border: 1px solid #ccd0d7;
  border-radius: 8px;
  background: #ffffff;
  color: #000000;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 150%;
}

.input:focus {
  outline: none;
  border-color: #336df2;
}

.row--image {
  align-items: flex-start;
  height: auto;
}

.image-field {
  width: 433px;
}

.file-input {
  display: none;
}

.image-dropzone {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 433px;
  padding: 22px 26px 26px;
  border: 1px dashed #ccd0d7;
  border-radius: 6px;
  color: #646c80;
  cursor: pointer;
}

.image-dropzone p {
  margin: 0;
  font-size: 14px;
}

.image-dropzone button,
.image-preview button {
  padding: 0;
  border: none;
  background: transparent;
  color: #336df2;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.image-dropzone small,
.image-hint {
  color: #646c80;
  font-size: 12px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 433px;
}

.image-preview img {
  width: 433px;
  height: 200px;
  border: 1px solid #ccd0d7;
  border-radius: 8px;
  object-fit: cover;
}

.image-hint {
  display: block;
  margin-top: 8px;
}

.field-error {
  margin: 4px 0 0;
  color: #c82438;
  font-size: 12px;
}

.divider {
  width: 100%;
  border-top: 1px solid #ccd0d7;
}

.section-title {
  margin: 0;
  color: #646c80;
  font-size: 16px;
  font-weight: 500;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 1072px;
  max-width: 100%;
}

.option-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  width: 1072px;
  max-width: 100%;
  overflow: visible;
}

.option-row--dragging {
  opacity: 0.5;
}

.drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 22px;
  cursor: grab;
}

.option-fields {
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 12px;
  width: 925px;
  max-width: 100%;
  min-width: 0;
}

.option-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 240px;
  min-width: 0;
  color: #646c80;
  font-size: 14px;
}

.option-field--name {
  width: 422px;
  flex: 1 1 422px;
}

.option-field > span > span {
  color: #c82438;
}

.option-field input {
  box-sizing: border-box;
  width: 100%;
  height: 38px;
  padding: 9px 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #000000;
  font: inherit;
}

.price-input {
  position: relative;
  display: flex;
  align-items: center;
}

.price-input input {
  padding-right: 36px;
}

.price-input > span {
  position: absolute;
  right: 13px;
  color: #9aa1b0 !important;
  font-size: 16px;
}

.remove-option {
  flex-shrink: 0;
  align-self: end;
  height: 38px;
  margin-bottom: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #336df2;
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.remove-option:disabled {
  color: #b3b8c4;
  cursor: not-allowed;
}

.add-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 185px;
  height: 44px;
  border: 1px solid #336df2;
  border-radius: 8px;
  background: #ffffff;
  color: #336df2;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta .row {
  width: auto;
}

.meta-value {
  color: #323640;
  font-size: 16px;
}

.delete-wrap {
  display: flex;
  justify-content: flex-end;
  width: 1120px;
  max-width: 100%;
  margin-top: 24px;
}

.delete-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #80899c;
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.delete-link img {
  width: 24px;
  height: 24px;
}

@media (max-width: 1200px) {
  .option-row {
    grid-template-columns: 20px minmax(220px, 1fr) 180px 180px auto;
  }
}
</style>
