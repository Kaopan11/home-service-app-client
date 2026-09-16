<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TechnicianLayout from '@/components/technician/TechnicianLayout.vue'
import { acceptTechnicianJob, listWaitingAcceptJobs } from '@/services/technician'
import { useTechnicianJobsStore } from '@/stores/technicianJobs'
import { isApiError } from '@/types/auth'
import type { TechnicianJob } from '@/types/technician'

const jobsStore = useTechnicianJobsStore()
const jobs = ref<TechnicianJob[]>([])
const loading = ref(true)
const error = ref('')
const acceptingId = ref<number | null>(null)

onMounted(loadJobs)

async function loadJobs(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    jobs.value = await listWaitingAcceptJobs()
    jobsStore.setPendingCount(jobs.value.length)
  } catch (err) {
    jobs.value = []
    jobsStore.setPendingCount(0)
    error.value = isApiError(err) ? err.message : 'ไม่สามารถโหลดคำขอบริการซ่อมได้'
  } finally {
    loading.value = false
  }
}

async function acceptJob(job: TechnicianJob): Promise<void> {
  acceptingId.value = job.id
  error.value = ''
  try {
    await acceptTechnicianJob(job.id)
    jobs.value = jobs.value.filter((item) => item.id !== job.id)
    jobsStore.setPendingCount(jobs.value.length)
  } catch (err) {
    error.value = isApiError(err) ? err.message : 'ไม่สามารถรับงานได้'
  } finally {
    acceptingId.value = null
  }
}
</script>

<template>
  <TechnicianLayout active="requests">
    <template #topbar>
      <h1 class="page-title">คำขอบริการซ่อม</h1>
    </template>

    <p v-if="loading" class="status">กำลังโหลดคำขอบริการซ่อม...</p>
    <p v-else-if="error" class="status status--error">{{ error }}</p>
    <p v-else-if="!jobs.length" class="status">ยังไม่มีงานที่รอรับ</p>
    <ul v-else class="job-list">
      <li v-for="job in jobs" :key="job.id" class="job-card">
        <div>
          <h2>{{ job.serviceName }}</h2>
          <p>{{ job.customerName }}</p>
          <p>{{ job.address }}</p>
        </div>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="acceptingId === job.id"
          @click="acceptJob(job)"
        >
          {{ acceptingId === job.id ? 'กำลังรับงาน...' : 'รับงาน' }}
        </button>
      </li>
    </ul>
  </TechnicianLayout>
</template>

<style scoped>
.page-title {
  margin: 0;
  color: var(--gray-800);
  font-size: 20px;
  font-weight: var(--font-weight-medium);
}

.status {
  margin: 0;
  color: var(--gray-700);
}

.status--error {
  color: var(--red);
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-width: 1120px;
}

.job-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 8px;
}

.job-card h2 {
  margin: 0 0 8px;
  color: var(--gray-950);
  font-size: 18px;
  font-weight: var(--font-weight-medium);
}

.job-card p {
  margin: 0;
  color: var(--gray-700);
  font-size: 14px;
}

.job-card .btn {
  width: 112px;
  height: 44px;
  flex-shrink: 0;
}
</style>
