<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { icons } from '@/constants/icons'
import { formatAdminDateTime } from '@/data/adminServices'
import { getUnreadCount, listNotifications, markNotificationRead } from '@/services/notifications'
import type { NotificationItem } from '@/types/notification'

const open = ref(false)
const unreadCount = ref(0)
const items = ref<NotificationItem[]>([])
const loading = ref(false)

onMounted(refreshUnreadCount)

async function refreshUnreadCount(): Promise<void> {
  try {
    unreadCount.value = await getUnreadCount()
  } catch {
    // ponytail: silently ignore, bell just shows 0 — no toast infra wired yet
  }
}

async function toggleOpen(): Promise<void> {
  open.value = !open.value
  if (!open.value) {
    return
  }
  loading.value = true
  try {
    items.value = await listNotifications()
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function handleRead(item: NotificationItem): Promise<void> {
  if (item.read) {
    return
  }
  try {
    await markNotificationRead(item.id)
    item.read = true
    await refreshUnreadCount()
  } catch {
    // ponytail: best-effort mark-as-read, ignore failure
  }
}
</script>

<template>
  <div class="bell-wrap">
    <button type="button" class="bell-btn" aria-label="การแจ้งเตือน" @click="toggleOpen">
      <img :src="icons.notification.outline" width="24" height="24" alt="" />
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <div v-if="open" class="dropdown">
      <p v-if="loading" class="status">กำลังโหลด...</p>
      <p v-else-if="!items.length" class="status">ไม่มีการแจ้งเตือน</p>
      <ul v-else class="list">
        <li
          v-for="item in items"
          :key="item.id"
          class="item"
          :class="{ 'item--unread': !item.read }"
          @click="handleRead(item)"
        >
          <p class="item-title">{{ item.title }}</p>
          <p class="item-body">{{ item.body }}</p>
          <p class="item-date">{{ formatAdminDateTime(item.createdAt) }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.bell-wrap {
  position: relative;
}

.bell-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 100px;
  background: #c82438;
  color: #f1f1f1;
  font-size: 12px;
  line-height: 1;
}

.dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  width: 320px;
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
}

.status {
  margin: 0;
  padding: 12px;
  color: var(--gray-700);
  font-size: 14px;
  text-align: center;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.item:hover {
  background: var(--gray-100);
}

.item--unread {
  background: #eef3ff;
}

.item-title {
  margin: 0 0 2px;
  color: var(--gray-800);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
}

.item-body {
  margin: 0 0 4px;
  color: var(--gray-700);
  font-size: 13px;
}

.item-date {
  margin: 0;
  color: var(--gray-500);
  font-size: 12px;
}
</style>
