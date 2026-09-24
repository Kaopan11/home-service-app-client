<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CustomerAccountLayout from '@/components/layout/CustomerAccountLayout.vue'
import { icons } from '@/constants/icons'
import { apiFetch } from '@/services/api'
import { formatAddressSummary, getSavedUserAddress } from '@/services/userService'

type OrderStatus = 'pending' | 'progress' | 'done'

type OrderCard = {
  code: string
  status: OrderStatus
  datetime: string
  staff: string
  items: string[]
  total: string
}

type DetailLine = {
  name: string
  quantity: string
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
const selected = ref<OrderCard | null>(null)
const showDetail = computed(() => !isHistory.value)
const detailWhen = computed(() => splitWhen(selected.value?.datetime ?? ''))
const detailItems = computed(() => (selected.value?.items ?? []).map(splitItem))
const detailAddress = computed(() => formatAddressSummary(getSavedUserAddress()))
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

function splitWhen(datetime: string): { date: string; time: string } {
  const match = datetime.match(/(\d{2}\/\d{2}\/\d{4})\s+เวลา\s+(\d{2}\.\d{2}\s*น\.)/)
  if (!match) {
    return { date: datetime.replace(/^[^:]+:\s*/, '') || '-', time: '-' }
  }
  return { date: match[1], time: match[2] }
}

function splitItem(item: string): DetailLine {
  const match = item.match(/^(.*)\s+(\d+)\s+\S+$/)
  if (!match) {
    return { name: item, quantity: '' }
  }
  return { name: match[1], quantity: `${match[2]} รายการ` }
}

function openDetail(order: OrderCard): void {
  selected.value = order
}

function closeDetail(): void {
  selected.value = null
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && selected.value) {
    closeDetail()
  }
}

watch(selected, (order) => {
  document.body.style.overflow = order ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
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
        <button
          v-if="showDetail"
          class="btn btn--primary card-order__action"
          type="button"
          @click="openDetail(order)"
        >
          ดูรายละเอียด
        </button>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="selected" class="overlay" @click.self="closeDetail">
        <article
          class="order-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <button class="order-detail__close" type="button" aria-label="ปิด" @click="closeDetail">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.4 18.308 5.692 17.6 11.292 12 5.692 6.4 6.4 5.692 12 11.292 17.6 5.692 18.308 6.4 12.708 12 18.308 17.6 17.6 18.308 12 12.708 6.4 18.308Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <header>
            <h2 id="order-detail-title">{{ selected.code }}</h2>
          </header>
          <section class="order-detail__body">
            <ul>
              <li v-for="line in detailItems" :key="line.name">
                <span>{{ line.name }}</span>
                <span v-if="line.quantity">{{ line.quantity }}</span>
              </li>
            </ul>
            <hr />
            <dl>
              <div>
                <dt>วันที่</dt>
                <dd>{{ detailWhen.date }}</dd>
              </div>
              <div>
                <dt>เวลา</dt>
                <dd>{{ detailWhen.time }}</dd>
              </div>
              <div v-if="selected.staff">
                <dt>ช่างที่มารับงาน</dt>
                <dd>{{ selected.staff }}</dd>
              </div>
              <div v-if="detailAddress">
                <dt>สถานที่</dt>
                <dd>{{ detailAddress }}</dd>
              </div>
            </dl>
            <hr />
            <p class="order-detail__total">
              <span>รวม</span>
              <strong>{{ selected.total }}</strong>
            </p>
          </section>
        </article>
      </div>
    </Teleport>
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

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(0 28 89 / 0.55);
}

.order-detail {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 542px);
  padding: 40px 60px;
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
}

.order-detail__close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: 48px;
  height: 48px;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
}

.order-detail header {
  margin: 0 0 38px;
  text-align: center;
}

.order-detail h2 {
  margin: 0 auto;
  max-width: 254px;
  color: var(--gray-950);
  font-family: var(--font-family);
  font-size: var(--headline-1-size);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height);
  text-align: center;
}

.order-detail__body {
  display: flex;
  flex-direction: column;
  gap: 26px;
  width: 100%;
}

.order-detail ul,
.order-detail dl {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.order-detail ul {
  gap: 12px;
  list-style: none;
}

.order-detail dl {
  gap: 12px;
}

.order-detail li,
.order-detail dl div,
.order-detail__total {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--body-3-size);
  line-height: var(--line-height);
}

.order-detail li {
  color: var(--black);
  font-weight: var(--font-weight-regular);
}

.order-detail li span:last-child {
  flex-shrink: 0;
  text-align: right;
}

.order-detail hr {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid var(--gray-300);
}

.order-detail dt {
  flex-shrink: 0;
  color: var(--gray-700);
  font-weight: var(--font-weight-light);
}

.order-detail dd {
  margin: 0;
  max-width: 187px;
  color: var(--black);
  font-weight: var(--font-weight-regular);
  text-align: right;
}

.order-detail__total {
  font-size: var(--body-2-size);
}

.order-detail__total span {
  color: var(--gray-700);
  font-weight: var(--font-weight-light);
}

.order-detail__total strong {
  color: var(--black);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 768px) {
  .orders-list {
    gap: 24px;
  }

  .order-detail {
    padding: 32px 20px;
  }
}
</style>
