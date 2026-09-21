import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getWaitingAcceptCount } from '@/services/technician'

export const useTechnicianJobsStore = defineStore('technicianJobs', () => {
  const pendingCount = ref(0)

  async function refreshPendingCount(): Promise<void> {
    try {
      pendingCount.value = await getWaitingAcceptCount()
    } catch {
      pendingCount.value = 0
    }
  }

  function setPendingCount(count: number): void {
    pendingCount.value = Math.max(0, count)
  }

  return {
    pendingCount,
    refreshPendingCount,
    setPendingCount,
  }
})
