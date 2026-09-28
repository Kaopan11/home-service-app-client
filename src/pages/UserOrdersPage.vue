<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CustomerAccountLayout from '@/components/layout/CustomerAccountLayout.vue'
import { icons } from '@/constants/icons'
import { apiFetch } from '@/services/api'
import { formatAddressSummary, getSavedUserAddress } from '@/services/userService'
import { isApiError } from '@/types/auth'

type OrderStatus = 'pending' | 'progress' | 'done'

type OrderCard = {
  jobId: number
  code: string
  status: OrderStatus
  datetime: string
  staff: string
  items: string[]
  total: string
  rating: number | null
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
const reviewing = ref<OrderCard | null>(null)
const reviewRating = ref(0)
const reviewComment = ref('')
const reviewSaving = ref(false)
const reviewError = ref('')
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

function isWaitingStaff(order: OrderCard): boolean {
  return !order.staff && order.status === 'pending'
}

function staffLabel(order: OrderCard): string {
  if (order.staff) return order.staff
  if (order.status === 'pending') return 'กำลังรอช่างรับงาน'
  return '-'
}

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
  if (event.key !== 'Escape') {
    return
  }
  if (reviewing.value && !reviewSaving.value) {
    closeReview()
    return
  }
  if (selected.value) {
    closeDetail()
  }
}

function openReview(order: OrderCard): void {
  reviewing.value = order
  reviewRating.value = 0
  reviewComment.value = ''
  reviewError.value = ''
}

function closeReview(): void {
  if (reviewSaving.value) {
    return
  }
  reviewing.value = null
}

async function submitReview(): Promise<void> {
  const order = reviewing.value
  if (!order || reviewSaving.value) {
    return
  }
  if (reviewRating.value < 1) {
    reviewError.value = 'กรุณาเลือกคะแนน 1 ถึง 5 ดาว'
    return
  }
  reviewSaving.value = true
  reviewError.value = ''
  try {
    const response = await apiFetch<{ data: OrderCard[] }>(`/api/orders/${order.jobId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        rating: reviewRating.value,
        comment: reviewComment.value.trim() || null,
      }),
    })
    const saved = response.data?.[0]
    orders.value = orders.value.map((item) =>
      item.jobId === order.jobId
        ? { ...item, rating: saved?.rating ?? reviewRating.value }
        : item,
    )
    reviewing.value = null
  } catch (err) {
    reviewError.value = isApiError(err) ? err.message : 'ไม่สามารถส่งรีวิวได้'
  } finally {
    reviewSaving.value = false
  }
}

watch(
  [selected, reviewing],
  ([order, review]) => {
    document.body.style.overflow = order || review ? 'hidden' : ''
  },
)

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
          <span v-if="isWaitingStaff(order)" class="staff-waiting">กำลังรอช่างรับงาน</span>
          <span v-else>พนักงาน: {{ order.staff || '-' }}</span>
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
        <button
          v-else-if="!order.rating"
          class="btn btn--primary card-order__action"
          type="button"
          @click="openReview(order)"
        >
          ให้คะแนน
        </button>
        <p v-else class="card-order__reviewed" aria-label="คะแนนที่ให้ไว้">
          <svg
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ 'star--on': (order.rating ?? 0) >= star }"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
        </p>
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
              <div>
                <dt>ช่างที่มารับงาน</dt>
                <dd :class="{ 'staff-waiting': isWaitingStaff(selected) }">{{ staffLabel(selected) }}</dd>
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

    <Teleport to="body">
      <div v-if="reviewing" class="overlay" @click.self="closeReview">
        <article
          class="review-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-title"
        >
          <button class="order-detail__close" type="button" aria-label="ปิด" :disabled="reviewSaving" @click="closeReview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.4 18.308 5.692 17.6 11.292 12 5.692 6.4 6.4 5.692 12 11.292 17.6 5.692 18.308 6.4 12.708 12 18.308 17.6 17.6 18.308 12 12.708 6.4 18.308Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <h2 id="review-title">ให้คะแนนความพึงพอใจ</h2>
          <p class="review-dialog__code">{{ reviewing.code }}</p>
          <div class="review-stars" role="radiogroup" aria-label="คะแนน">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="review-star"
              :class="{ 'review-star--on': reviewRating >= star }"
              :aria-checked="reviewRating === star"
              role="radio"
              :aria-label="`${star} ดาว`"
              @click="reviewRating = star"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </button>
          </div>
          <label class="review-comment">
            ความคิดเห็น
            <textarea v-model="reviewComment" rows="4" maxlength="500" placeholder="บอกความรู้สึกเกี่ยวกับบริการ (ไม่บังคับ)" />
          </label>
          <p v-if="reviewError" class="review-error" role="alert">{{ reviewError }}</p>
          <div class="review-actions">
            <button type="button" class="btn btn--secondary" :disabled="reviewSaving" @click="closeReview">
              ยกเลิก
            </button>
            <button type="button" class="btn btn--primary" :disabled="reviewSaving" @click="submitReview">
              {{ reviewSaving ? 'กำลังส่ง...' : 'ส่งรีวิว' }}
            </button>
          </div>
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

.staff-waiting {
  color: var(--blue-700);
  font-weight: var(--font-weight-medium);
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

.card-order__reviewed {
  grid-area: action;
  justify-self: end;
  align-self: end;
  display: flex;
  gap: 2px;
  margin: 0;
}

.star {
  color: var(--gray-300);
}

.star--on {
  color: #f4b400;
}

.review-dialog {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 420px);
  padding: 40px 32px 32px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 2px 2px 24px rgb(23 51 106 / 0.12);
}

.review-dialog h2 {
  margin: 0;
  color: var(--gray-950);
  font-size: var(--headline-4-size, 20px);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.review-dialog__code {
  margin: 8px 0 20px;
  color: var(--gray-600);
  font-size: var(--body-3-size);
  text-align: center;
}

.review-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.review-star {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--gray-300);
  cursor: pointer;
}

.review-star--on {
  color: #f4b400;
}

.review-comment {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--gray-700);
  font-size: var(--body-3-size);
}

.review-comment textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font: inherit;
  resize: vertical;
}

.review-error {
  margin: 12px 0 0;
  color: #c82438;
  font-size: 14px;
  text-align: center;
}

.review-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
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
