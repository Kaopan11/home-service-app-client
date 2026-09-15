<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { icons } from '@/constants/icons'
import { filterAdminServices, formatAdminDateTime, MOCK_ADMIN_SERVICES } from '@/data/adminServices'
import { deleteAdminService, listAdminServices } from '@/services/adminServices'
import type { AdminServiceItem } from '@/types/adminService'

const router = useRouter()
const query = ref('')
const rows = ref<AdminServiceItem[]>([...MOCK_ADMIN_SERVICES])
const loading = ref(true)
const usingFallback = ref(false)

const visibleRows = computed(() => filterAdminServices(rows.value, query.value))

onMounted(async () => {
  loading.value = true
  try {
    const data = await listAdminServices()
    rows.value = data
    usingFallback.value = data === MOCK_ADMIN_SERVICES
    if (!data.length) {
      rows.value = MOCK_ADMIN_SERVICES
      usingFallback.value = true
    }
  } finally {
    loading.value = false
  }
})

async function handleDelete(item: AdminServiceItem): Promise<void> {
  if (!confirm(`ลบบริการ “${item.name}” ?`)) {
    return
  }
  try {
    await deleteAdminService(item.id)
    rows.value = rows.value.filter((row) => row.id !== item.id)
  } catch {
    rows.value = rows.value.filter((row) => row.id !== item.id)
  }
}
</script>

<template>
  <AdminLayout active="services">
    <template #topbar>
      <h1 class="page-title">บริการ</h1>
      <label class="search">
        <img :src="icons.admin.search" width="24" height="24" alt="" />
        <input v-model="query" type="search" placeholder="ค้นหาบริการ..." />
      </label>
      <button type="button" class="add-btn" @click="router.push({ name: 'admin-service-new' })">
        เพิ่มบริการ
        <img :src="icons.admin.plus" width="20" height="20" alt="" />
      </button>
    </template>

    <p v-if="usingFallback && !loading" class="fallback">แสดงข้อมูลตัวอย่าง เพราะยังเชื่อม API ไม่ได้</p>

    <div class="table-wrap">
      <table class="service-table">
        <thead>
          <tr>
            <th class="col-drag" />
            <th class="col-index">ลำดับ</th>
            <th>ชื่อบริการ</th>
            <th>หมวดหมู่</th>
            <th>สร้างเมื่อ</th>
            <th>แก้ไขล่าสุด</th>
            <th class="col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visibleRows" :key="item.id">
            <td class="col-drag">
              <img :src="icons.admin.drag" width="56" height="80" alt="" />
            </td>
            <td class="col-index">{{ item.sortOrder }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span class="tag" :class="`tag--${item.categoryTone}`">{{ item.categoryName }}</span>
            </td>
            <td>{{ formatAdminDateTime(item.createdAt) }}</td>
            <td>{{ formatAdminDateTime(item.updatedAt) }}</td>
            <td class="col-action">
              <button type="button" class="icon-btn" aria-label="ลบ" @click="handleDelete(item)">
                <img :src="icons.admin.trash" width="24" height="24" alt="" />
              </button>
              <button
                type="button"
                class="icon-btn"
                aria-label="แก้ไข"
                @click="router.push({ name: 'admin-service-edit', params: { id: String(item.id) } })"
              >
                <img :src="icons.admin.edit" width="24" height="24" alt="" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: var(--gray-800);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  height: 40px;
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
  color: var(--gray-500);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: var(--blue-600);
  color: var(--white);
  font: inherit;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.add-btn img {
  width: 20px;
  height: 20px;
}

.fallback {
  margin: 0 0 16px;
  color: var(--gray-700);
  font-size: 14px;
}

.table-wrap {
  overflow: auto;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--white);
}

.service-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.service-table th {
  padding: 10px 24px;
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  text-align: left;
}

.service-table td {
  padding: 24px;
  border-top: 1px solid var(--gray-200);
  color: var(--black);
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
}

.col-index {
  width: 58px;
  text-align: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.col-action {
  width: 120px;
  text-align: center;
}

.tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: var(--font-weight-regular);
}

.tag--general {
  background: var(--blue-100);
  color: var(--blue-800);
}

.tag--kitchen {
  background: var(--purple-100);
  color: var(--purple-900);
}

.tag--bathroom {
  background: var(--green-100);
  color: var(--green-900);
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
