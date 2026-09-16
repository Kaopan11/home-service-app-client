<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  open: boolean
  itemName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

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
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="alert-title">
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
            <span class="icon" aria-hidden="true">!</span>
            <h2 id="alert-title" class="title">ยืนยันการลบรายการ?</h2>
            <p class="message">
              <span>คุณต้องการลบรายการ ‘{{ itemName }}’</span>
              <span>ใช่หรือไม่</span>
            </p>
          </div>
          <div class="actions">
            <button type="button" class="btn btn--primary" :disabled="loading" @click="emit('confirm')">
              {{ loading ? 'กำลังลบ...' : 'ลบรายการ' }}
            </button>
            <button type="button" class="btn btn--secondary" :disabled="loading" @click="requestCancel">
              ยกเลิก
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
  width: 360px;
  height: 270px;
  background: #ffffff;
  box-shadow: 2px 2px 24px rgb(23 51 106 / 0.12);
  border-radius: 16px;
}

.close {
  position: absolute;
  top: 0;
  left: 312px;
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
  position: absolute;
  top: 36px;
  left: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 280px;
}

.copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 280px;
}

.icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #c82438;
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
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
  height: 48px;
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
