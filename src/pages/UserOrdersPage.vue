<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CustomerAccountLayout from '@/components/layout/CustomerAccountLayout.vue'
import { icons } from '@/constants/icons'
import { apiFetch } from '@/services/api'

type OrderStatus = 'pending' | 'progress' | 'done'

type OrderCard = {
  code: string
  status: OrderStatus
  datetime: string
  staff: string
  items: string[]
  total: string
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  progress: 'กำลังดำเนินการ',
  done: 'ดำเนินการสำเร็จ',
}

const route = useRoute()
const isHistory = computed(() => route.name === 'user-history')
const orders = ref<OrderCard[]>([])
const loaded = ref(false)
const showDetail = computed(() => !isHistory.value)
const pageTitle = computed(() => (isHistory.value ? 'ประวัติการซ่อม' : 'รายการคำสั่งซ่อม'))
const emptyMessage = computed(() =>
  isHistory.value ? 'ยังไม่มีประวัติการซ่อม' : 'ยังไม่มีรายการคำสั่งซ่อม',
)

watch(
  isHistory,
  async (history) => {
    loaded.value = false
    try {
      const scope = history ? 'history' : 'active'
      const response = await apiFetch<{ data: OrderCard[] }>(`/api/orders?scope=${scope}`)
      orders.value = response.data ?? []
    } catch {
      orders.value = []
    } finally {
      loaded.value = true
    }
  },
  { immediate: true },
)

function statusClass(status: OrderStatus): string {
  if (status === 'progress') return 'status status--progress'
  if (status === 'done') return 'status status--done'
  return 'status'
}
</script>

<template>
  <CustomerAccountLayout>
    <template #banner>
      <h1>{{ pageTitle }}</h1>
    </template>
    <section class="orders-list" :aria-label="pageTitle">
      <article v-if="loaded && !orders.length" class="orders-empty">
        <p>{{ emptyMessage }}</p>
        <RouterLink v-if="!isHistory" class="btn btn--primary" :to="{ name: 'service' }">
          ดูบริการของเรา
        </RouterLink>
      </article>
      <article v-for="(order, index) in orders" :key="`${order.code}-${index}`" class="card-order">
        <h2 class="card-order__title">คำสั่งการซ่อมรหัส : {{ order.code }}</h2>
        <p class="card-order__status">
          สถานะ:
          <span :class="statusClass(order.status)">{{ STATUS_LABEL[order.status] }}</span>
        </p>
        <p class="card-order__date">
          <img class="icon" :src="icons.customerServices.calendar" alt="" width="20" height="20" />
          {{ order.datetime }}
        </p>
        <p class="card-order__staff">
          <img class="icon" :src="icons.customerServices.person" alt="" width="20" height="20" />
          พนักงาน: {{ order.staff }}
        </p>
        <p class="card-order__price">
          ราคารวม:
          <strong>{{ order.total }}</strong>
        </p>
        <div class="card-order__items">
          <h3>รายการ:</h3>
          <ul>
            <li v-for="item in order.items" :key="item">{{ item }}</li>
          </ul>
        </div>
        <button v-if="showDetail" class="btn btn--primary card-order__action" type="button">
          ดูรายละเอียด
        </button>
      </article>
    </section>
  </CustomerAccountLayout>
</template>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orders-empty {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 206px;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
}

.orders-empty p {
  margin: 0;
  color: var(--gray-600);
  font-family: var(--font-family);
  font-size: var(--body-2-size);
  line-height: var(--line-height);
  text-align: center;
}

@media (max-width: 768px) {
  .orders-list {
    gap: 24px;
  }
}
</style>
