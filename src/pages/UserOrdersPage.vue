<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CustomerAccountLayout from '@/components/layout/CustomerAccountLayout.vue'
import { icons } from '@/constants/icons'

type OrderStatus = 'pending' | 'progress' | 'done'

type OrderCard = {
  code: string
  status: OrderStatus
  datetime: string
  staff: string
  items: string[]
  total: string
}

const LIST_ORDERS: OrderCard[] = [
  {
    code: 'AD04071205',
    status: 'pending',
    datetime: 'วันเวลาดำเนินการ: 25/04/2563 เวลา 13.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
  {
    code: 'AD04071205',
    status: 'pending',
    datetime: 'วันเวลาดำเนินการ: 25/04/2563 เวลา 13.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
  {
    code: 'AD04071205',
    status: 'progress',
    datetime: 'วันเวลาดำเนินการ: 25/04/2563 เวลา 13.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
]

const HISTORY_ORDERS: OrderCard[] = [
  {
    code: 'AD04071205',
    status: 'done',
    datetime: 'วันเวลาดำเนินการสำเร็จ: 25/04/2563 เวลา 16.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
  {
    code: 'AD04071205',
    status: 'done',
    datetime: 'วันเวลาดำเนินการสำเร็จ: 25/04/2563 เวลา 16.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
  {
    code: 'AD04071205',
    status: 'done',
    datetime: 'วันเวลาดำเนินการสำเร็จ: 25/04/2563 เวลา 16.00 น.',
    staff: 'สมาน เยี่ยมยอด',
    items: ['ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง'],
    total: '1,550.00 ฿',
  },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  progress: 'กำลังดำเนินการ',
  done: 'ดำเนินการสำเร็จ',
}

const route = useRoute()
const isHistory = computed(() => route.name === 'user-history')
const orders = computed(() => (isHistory.value ? HISTORY_ORDERS : LIST_ORDERS))
const showDetail = computed(() => !isHistory.value)
const pageTitle = computed(() => (isHistory.value ? 'ประวัติการซ่อม' : 'รายการคำสั่งซ่อม'))

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

@media (max-width: 768px) {
  .orders-list {
    gap: 24px;
  }
}
</style>
