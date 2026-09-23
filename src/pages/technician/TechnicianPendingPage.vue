<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import SelectDropdown from '@/components/ui/SelectDropdown.vue'
import { icons } from '@/constants/icons'
import { getTechnicianPendingJobs } from '@/services/technician'
import type { TechnicianJobItem } from '@/types/technician'
import { formatThaiCurrency, formatThaiDateTime } from '@/utils/technicianFormatters'

const router = useRouter()

const jobs = ref<TechnicianJobItem[]>([])
const loading = ref(true)
const error = ref('')

// Filters
const searchQuery = ref('')
const selectedService = ref('ทั้งหมด')
const selectedSort = ref('soonest')

const sortOptions = [
  { label: 'วันดำเนินการที่ใกล้ถึง', value: 'soonest' },
  { label: 'รายการล่าสุด', value: 'latest' },
]

onMounted(loadJobs)

watch(selectedSort, () => {
  void loadJobs()
})

async function loadJobs(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    jobs.value = await getTechnicianPendingJobs(selectedSort.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการคำสั่งซ่อมได้'
    jobs.value = []
  } finally {
    loading.value = false
  }
}

// Extract unique service names for the dropdown
const serviceOptions = computed(() => {
  const set = new Set<string>()
  jobs.value.forEach((job) => {
    if (job.serviceName) set.add(job.serviceName)
  })
  return ['ทั้งหมด', ...Array.from(set)]
})

// Filter jobs by search and service
const filteredJobs = computed(() => {
  let list = jobs.value

  if (selectedService.value && selectedService.value !== 'ทั้งหมด') {
    list = list.filter((job) => job.serviceName === selectedService.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (job) =>
        job.orderCode.toLowerCase().includes(q) ||
        job.serviceName.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        (job.categoryName && job.categoryName.toLowerCase().includes(q)),
    )
  }

  return list
})

function goDetail(id: number): void {
  void router.push({ name: 'technician-pending-detail', params: { id: String(id) } })
}
</script>

<template>
  <TechnicianLayout active="jobs">
    <template #topbar>
      <h1 class="page-title">รายการที่รอดำเนินการ</h1>
      <label class="search-bar">
        <img :src="icons.admin.search" width="20" height="20" alt="" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="ค้นหารายการคำสั่งซ่อม"
        />
      </label>
    </template>

    <div class="pending-container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">บริการ</span>
          <div class="filter-dropdown-wrap">
            <SelectDropdown
              v-model="selectedService"
              :options="serviceOptions"
              placeholder="เลือกบริการ"
            />
          </div>
        </div>

        <div class="filter-item">
          <span class="filter-label">เรียงตาม</span>
          <div class="filter-dropdown-wrap">
            <SelectDropdown
              v-model="selectedSort"
              :options="sortOptions"
              placeholder="เรียงตาม"
              :searchable="false"
            />
          </div>
        </div>
      </div>

      <!-- State Messages -->
      <div v-if="loading" class="state-box">
        <p>กำลังโหลดข้อมูลรายการที่รอดำเนินการ...</p>
      </div>

      <div v-else-if="error" class="state-box state-box--error">
        <p>{{ error }}</p>
        <button type="button" class="retry-btn" @click="loadJobs">ลองใหม่</button>
      </div>

      <div v-else-if="filteredJobs.length === 0" class="state-box state-box--empty">
        <p v-if="searchQuery || selectedService !== 'ทั้งหมด'">ไม่พบรายการคำสั่งซ่อมที่ตรงกับเงื่อนไข</p>
        <p v-else>ยังไม่มีรายการที่รอดำเนินการ</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="jobs-table">
          <thead>
            <tr>
              <th class="col-service">ชื่อบริการ</th>
              <th class="col-date">วันเวลาดำเนินการ</th>
              <th class="col-code">รหัสคำสั่งซ่อม</th>
              <th class="col-price">ราคารวม</th>
              <th class="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.id">
              <td class="col-service">{{ job.serviceName }}</td>
              <td class="col-date">{{ formatThaiDateTime(job.scheduledAt) }}</td>
              <td class="col-code">{{ job.orderCode }}</td>
              <td class="col-price">{{ formatThaiCurrency(job.totalPrice) }}</td>
              <td class="col-action">
                <button
                  type="button"
                  class="action-btn"
                  title="ดูรายละเอียด / จัดการงาน"
                  aria-label="ดูรายละเอียด"
                  @click="goDetail(job.id)"
                >
                  <img :src="icons.admin.edit" width="20" height="20" alt="Action" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  flex: 1;
  color: var(--gray-800);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 320px;
  height: 44px;
  padding: 0 14px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
}

.search-bar img {
  opacity: 0.6;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--gray-900);
  font-size: 14px;
  outline: none;
}

.search-bar input::placeholder {
  color: var(--gray-400);
}

.pending-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1280px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  color: var(--gray-700);
  font-size: 14px;
  white-space: nowrap;
}

.filter-dropdown-wrap {
  width: 200px;
}

.table-wrap {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.jobs-table thead {
  background: var(--gray-100);
}

.jobs-table th {
  padding: 16px 20px;
  color: var(--gray-700);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  border-bottom: 1px solid var(--gray-200);
}

.jobs-table td {
  padding: 20px;
  color: var(--gray-900);
  border-bottom: 1px solid var(--gray-200);
  vertical-align: middle;
}

.jobs-table tbody tr:last-child td {
  border-bottom: none;
}

.jobs-table tbody tr:hover {
  background: var(--gray-50);
}

.col-service {
  min-width: 160px;
}

.col-date {
  min-width: 220px;
  color: var(--gray-700);
}

.col-code {
  min-width: 140px;
  color: var(--gray-700);
}

.col-price {
  min-width: 120px;
  color: var(--gray-900);
}

.col-action {
  width: 80px;
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--blue-200);
  border-radius: 6px;
  background: var(--blue-50);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--blue-100);
  border-color: var(--blue-400);
}

.action-btn img {
  opacity: 0.85;
}

.state-box {
  padding: 48px;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  text-align: center;
  color: var(--gray-600);
  font-size: 15px;
}

.state-box--error {
  color: var(--red);
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--blue-600);
  color: var(--white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .search-bar {
    width: 100%;
  }

  .filter-bar {
    gap: 16px;
  }

  .filter-item {
    width: 100%;
    justify-content: space-between;
  }

  .filter-dropdown-wrap {
    flex: 1;
    max-width: 240px;
  }
}
</style>
