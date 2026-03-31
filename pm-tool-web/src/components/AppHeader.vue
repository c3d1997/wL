<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

/**
 * 登出並重導至 /login
 */
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <!-- 品牌名稱 -->
    <div class="app-header__brand">PM Tool</div>

    <div class="app-header__actions">
      <!-- 通知鈴鐺：顯示未讀數 badge，未讀為 0 時隱藏 badge -->
      <RouterLink to="/notifications" class="app-header__bell" aria-label="通知">
        <span class="app-header__bell-icon">🔔</span>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="app-header__badge"
        >
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </span>
      </RouterLink>

      <!-- 使用者名稱 -->
      <span class="app-header__username">{{ authStore.user?.name }}</span>

      <!-- 登出按鈕 -->
      <button class="btn btn--secondary btn--sm" @click="handleLogout">
        登出
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $header-height;
  background-color: $color-white;
  border-bottom: 1px solid $color-gray-200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-6;
  z-index: 50;
  box-shadow: $shadow-sm;

  &__brand {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-primary;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-4;
  }

  &__bell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    transition: background-color $transition-fast;

    &:hover {
      background-color: $color-gray-100;
    }
  }

  &__bell-icon {
    font-size: $font-size-lg;
    line-height: 1;
  }

  // 未讀數 badge：右上角紅點
  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 18px;
    height: 18px;
    padding: 0 $spacing-1;
    background-color: $color-danger;
    color: $color-white;
    font-size: 11px;
    font-weight: 700;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  &__username {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-gray-700;
  }
}
</style>
