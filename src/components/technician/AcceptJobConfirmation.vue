<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { icons } from '@/constants/icons'

const props = defineProps<{
  open: boolean
  serviceName: string
  scheduledAt: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const whenLabel = computed(() => formatScheduledAt(props.scheduledAt))

function formatScheduledAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear() + 543
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} เวลา ${hours}.${minutes} น.`
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !props.open || props.loading) {
    return
  }
  emit('cancel')
}

function requestCancel(): void {
  if (props.loading) {
    return
  }
  emit('cancel')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
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
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="requestCancel">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="accept-title">
        <button type="button" class="close" aria-label="ปิด" :disabled="loading" @click="requestCancel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.4 18.308 5.692 17.6 11.292 12 5.692 6.4 6.4 5.692 12 11.292 17.6 5.692 18.308 6.4 12.708 12 18.308 17.6 17.6 18.308 12 12.708 6.4 18.308Z"
              fill="#7D8194"
            />
          </svg>
        </button>

        <div class="body">
          <div class="copy">
            <span class="work-icon" aria-hidden="true">
              <img :src="icons.technician.work" width="30" height="27" alt="" />
            </span>
            <h2 id="accept-title" class="title">ยืนยันการรับงาน?</h2>
            <p class="message">
              <span>คุณสามารถให้บริการ ‘{{ serviceName }}’ ในวันที่</span>
              <span>{{ whenLabel }}</span>
            </p>
          </div>
          <div class="actions">
            <button type="button" class="btn btn--secondary" :disabled="loading" @click="requestCancel">
              ยกเลิก
            </button>
            <button type="button" class="btn btn--primary" :disabled="loading" @click="emit('confirm')">
              {{ loading ? 'กำลังยืนยัน...' : 'ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgb(0 28 89 / 0.55);
}

.dialog {
  position: relative;
  box-sizing: border-box;
  width: 360px;
  min-height: 270px;
  padding: 36px 40px 32px;
  background: #ffffff;
  box-shadow: 2px 2px 24px rgb(23 51 106 / 0.12);
  border-radius: 16px;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: flex-start;
  width: 48px;
  height: 48px;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.close:disabled {
  cursor: not-allowed;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 280px;
}

.work-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: transparent;
}

.work-icon img {
  width: 30px;
  height: 27px;
  background: transparent;
}

.title {
  margin: 0;
  width: 280px;
  color: #191a1e;
  font-size: 20px;
  font-weight: 500;
  line-height: 150%;
  text-align: center;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  width: 280px;
  color: #636678;
  font-size: 16px;
  font-weight: 300;
  line-height: 150%;
  text-align: center;
}

.message span {
  display: block;
  width: 100%;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  width: 240px;
  height: 44px;
}

.btn {
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
  opacity: 0.7;
}

.btn--primary {
  border: none;
  background: #336df2;
  color: #ffffff;
}

.btn--secondary {
  box-sizing: border-box;
  border: 1px solid #336df2;
  background: #ffffff;
  color: #336df2;
}
</style>
