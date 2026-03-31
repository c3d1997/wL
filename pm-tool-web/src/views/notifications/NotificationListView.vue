<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()

// ====== 通知類型中文對應 ======
const typeLabel = {
  task_assigned: '任務指派',
  task_updated: '任務更新',
  meeting_created: '會議建立',
}

/**
 * 計算相對時間（幾分鐘前、幾小時前等）
 * @param {string} dateStr - ISO 8601 日期字串
 * @returns {string}
 */
const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 30) return `${days} 天前`
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

/**
 * 點擊通知：若未讀則標記為已讀
 * @param {Object} notification
 */
const handleClick = async (notification) => {
  if (!notification.isRead) {
    await notificationStore.markAsRead(notification.id)
  }
}

onMounted(async () => {
  await notificationStore.fetchNotifications()
})
</script>

<template>
  <div class="notification-list">
    <!-- 標題列 -->
    <div class="notification-list__header">
      <h1 class="notification-list__title">通知</h1>
      <button
        v-if="notificationStore.unreadCount > 0"
        class="btn btn--secondary btn--sm"
        @click="notificationStore.markAllAsRead()"
      >
        全部標記為已讀
      </button>
    </div>

    <!-- 未讀數提示 -->
    <p v-if="notificationStore.unreadCount > 0" class="notification-list__unread-hint">
      {{ notificationStore.unreadCount }} 則未讀通知
    </p>

    <!-- 載入中 -->
    <div v-if="notificationStore.isLoading" class="loading">載入中...</div>

    <!-- 通知列表 -->
    <div
      v-else-if="notificationStore.notifications.length > 0"
      class="notification-items"
    >
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ 'notification-item--unread': !notification.isRead }"
        @click="handleClick(notification)"
      >
        <div class="notification-item__left">
          <span class="notification-item__type-badge">
            {{ typeLabel[notification.type] ?? notification.type }}
          </span>
          <p class="notification-item__message">{{ notification.message }}</p>
        </div>
        <div class="notification-item__right">
          <span class="notification-item__time">
            {{ relativeTime(notification.createdAt) }}
          </span>
          <!-- 未讀指示圓點 -->
          <span v-if="!notification.isRead" class="notification-item__dot" />
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">🔔</span>
      <p class="empty-state__text">目前沒有通知</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification-list {
  max-width: 720px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-2;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-gray-900;
  }

  &__unread-hint {
    font-size: $font-size-sm;
    color: $color-gray-500;
    margin-bottom: $spacing-4;
  }
}

.notification-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-4;
  padding: $spacing-4 $spacing-5;
  background-color: $color-white;
  border-radius: $radius-lg;
  border: 1px solid $color-gray-200;
  cursor: pointer;
  transition: background-color $transition-fast, border-color $transition-fast;

  &:hover {
    border-color: $color-primary-light;
    background-color: #f5f3ff;
  }

  // 未讀通知底色加深
  &--unread {
    background-color: #ede9fe;
    border-color: $color-primary-light;
  }

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__type-badge {
    display: inline-block;
    font-size: $font-size-xs;
    font-weight: 600;
    color: $color-primary;
    background-color: #ede9fe;
    padding: 2px $spacing-2;
    border-radius: $radius-full;
    margin-bottom: $spacing-2;
  }

  &__message {
    font-size: $font-size-sm;
    color: $color-gray-800;
    line-height: 1.5;
    word-break: break-word;
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $spacing-2;
    flex-shrink: 0;
  }

  &__time {
    font-size: $font-size-xs;
    color: $color-gray-400;
    white-space: nowrap;
  }

  // 未讀紅點指示器
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: $radius-full;
    background-color: $color-danger;
  }
}
</style>
