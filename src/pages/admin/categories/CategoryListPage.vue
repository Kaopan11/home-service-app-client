<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import AlertConfirmation from '@/components/admin/AlertConfirmation.vue'
import { icons } from '@/constants/icons'
import { formatAdminDateTime } from '@/data/adminServices'
import { deleteCategory, listCategories, reorderCategories } from '@/services/categoryApi'
import type { CategoryDto } from '@/types/category'

const router = useRouter()
const query = ref('')
const rows = ref<CategoryDto[]>([])
const loading = ref(true)
const error = ref('')
const draggingId = ref<number | null>(null)
const pendingDelete = ref<CategoryDto | null>(null)
const deleting = ref(false)
const reordering = ref(false)
const canReorder = computed(() => !query.value.trim())

const visibleRows = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) {
    return rows.value
  }
  return rows.value.filter((item) => item.name.toLowerCase().includes(needle))
})

onMounted(loadCategories)

async function loadCategories(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    rows.value = await listCategories()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้'
  } finally {
    loading.value = false
  }
}

function goDetail(item: CategoryDto): void {
  void router.push({ name: 'admin-category-detail', params: { id: String(item.category_id) } })
}

function goEdit(item: CategoryDto): void {
  void router.push({ name: 'admin-category-edit', params: { id: String(item.category_id) } })
}

function onDragStart(item: CategoryDto, event: DragEvent): void {
  if (!canReorder.value) {
    event.preventDefault()
    return
  }
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-drag-handle]')) {
    event.preventDefault()
    return
  }
  draggingId.value = item.category_id
  event.dataTransfer?.setData('text/plain', String(item.category_id))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

async function onDrop(target: CategoryDto): Promise<void> {
  const fromId = draggingId.value
  draggingId.value = null
  if (!canReorder.value || fromId == null || fromId === target.category_id || reordering.value) {
    return
  }
  const fromIndex = rows.value.findIndex((row) => row.category_id === fromId)
  const toIndex = rows.value.findIndex((row) => row.category_id === target.category_id)
  if (fromIndex < 0 || toIndex < 0) {
    return
  }
  const previous = rows.value
  const next = [...rows.value]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  rows.value = next
  reordering.value = true
  try {
    rows.value = await reorderCategories(rows.value.map((row) => row.category_id))
  } catch (err) {
    rows.value = previous
    error.value = err instanceof Error ? err.message : 'ไม่สามารถเรียงลำดับหมวดหมู่ได้'
  } finally {
    reordering.value = false
  }
}

async function confirmDelete(): Promise<void> {
  if (!pendingDelete.value) {
    return
  }
  deleting.value = true
  try {
    await deleteCategory(pendingDelete.value.category_id)
    rows.value = rows.value.filter((row) => row.category_id !== pendingDelete.value?.category_id)
    pendingDelete.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถลบหมวดหมู่ได้'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AdminLayout active="categories">
    <template #topbar>
      <h1 class="page-title">หมวดหมู่</h1>
      <label class="search">
        <img :src="icons.admin.search" width="24" height="24" alt="" />
        <input v-model="query" type="search" placeholder="ค้นหาหมวดหมู่..." />
      </label>
      <button type="button" class="add-btn" @click="router.push({ name: 'admin-category-new' })">
        เพิ่มหมวดหมู่
        <img :src="icons.admin.plus" width="20" height="20" alt="" />
      </button>
    </template>

    <p v-if="loading" class="status">กำลังโหลดข้อมูลหมวดหมู่...</p>
    <p v-else-if="error" class="status status--error">{{ error }}</p>
    <p v-else-if="!rows.length" class="status">ยังไม่มีหมวดหมู่</p>
    <p v-else-if="!visibleRows.length" class="status">ไม่พบหมวดหมู่ที่ตรงกับการค้นหา</p>

    <div v-else class="table-wrap">
      <table class="category-table">
        <thead>
          <tr>
            <th class="col-drag" />
            <th class="col-index">ลำดับ</th>
            <th class="col-name">ชื่อหมวดหมู่</th>
            <th class="col-date">สร้างเมื่อ</th>
            <th>แก้ไขล่าสุด</th>
            <th class="col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in visibleRows"
            :key="item.category_id"
            :draggable="canReorder"
            :class="{ 'is-dragging': draggingId === item.category_id }"
            @dragstart="onDragStart(item, $event)"
            @dragend="draggingId = null"
            @dragover.prevent
            @drop.prevent="onDrop(item)"
          >
            <td class="col-drag" data-drag-handle>
              <img :src="icons.admin.drag" width="56" height="80" alt="" />
            </td>
            <td class="col-index">{{ index + 1 }}</td>
            <td class="col-name cell-link" @click="goDetail(item)">{{ item.name }}</td>
            <td class="cell-link" @click="goDetail(item)">{{ formatAdminDateTime(item.created_at) }}</td>
            <td class="cell-link" @click="goDetail(item)">{{ formatAdminDateTime(item.updated_at) }}</td>
            <td class="col-action">
              <button type="button" class="icon-btn" aria-label="ลบ" @click="pendingDelete = item">
                <img :src="icons.admin.trash" width="24" height="24" alt="" />
              </button>
              <button type="button" class="icon-btn" aria-label="แก้ไข" @click="goEdit(item)">
                <img :src="icons.admin.edit" width="24" height="24" alt="" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AlertConfirmation
      :open="Boolean(pendingDelete)"
      :item-name="pendingDelete?.name ?? ''"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </AdminLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: var(--black);
  font-size: var(--headline-2-size);
  font-weight: var(--font-weight-medium);
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 350px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
}

.search img {
  width: 24px;
  height: 24px;
}

.search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--gray-800);
  font: inherit;
}

.search input::placeholder {
  color: var(--gray-700);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 8px;
  background: var(--blue-600);
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.status {
  margin: 0;
  color: var(--gray-700);
}

.status--error {
  color: var(--red);
}

.table-wrap {
  width: 1120px;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--white);
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.category-table th {
  height: 41px;
  padding: 0 24px;
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: var(--body-3-size);
  font-weight: var(--font-weight-regular);
  text-align: left;
}

.category-table td {
  height: 88px;
  padding: 0 24px;
  border-top: 1px solid var(--gray-200);
  color: var(--black);
  font-size: var(--body-2-size);
  font-weight: var(--font-weight-light);
  vertical-align: middle;
}

.col-drag {
  width: 56px;
  padding: 0 !important;
}

.col-drag img {
  display: block;
  width: 56px;
  height: 80px;
  cursor: grab;
}

.col-index {
  width: 80px;
  text-align: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.col-name {
  width: 262px;
}

.col-date {
  width: 245px;
}

.col-action {
  width: 120px;
  text-align: center;
}

.cell-link {
  cursor: pointer;
}

.is-dragging {
  opacity: 0.5;
}

.icon-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.icon-btn + .icon-btn {
  margin-left: 24px;
}

.icon-btn img {
  width: 24px;
  height: 24px;
  display: block;
}
</style>
