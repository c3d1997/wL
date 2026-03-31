<script setup>
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const role = computed(() => authStore.userRole)

// ====== 依角色決定側邊欄選單 ======
const navItems = computed(() => {
  const items = []

  // 所有已登入使用者均可看到任務與會議
  items.push({ label: '任務', to: '/tasks', icon: '📋' })
  items.push({ label: '會議', to: '/meetings', icon: '📅' })

  // 僅 rd 可存取分支管理
  if (role.value === 'rd') {
    items.push({ label: '分支管理', to: '/branches', icon: '🌿' })
  }

  // 所有人都有通知
  items.push({ label: '通知', to: '/notifications', icon: '🔔' })

  // 僅 admin 可存取後台
  if (role.value === 'admin') {
    items.push({ label: '使用者管理', to: '/admin/users', icon: '👥' })
  }

  return items
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <div class="app-layout__body">
      <!-- 側邊導覽列 -->
      <nav class="app-sidebar">
        <ul class="app-sidebar__menu">
          <li v-for="item in navItems" :key="item.to" class="app-sidebar__item">
            <RouterLink
              :to="item.to"
              class="app-sidebar__link"
              active-class="app-sidebar__link--active"
            >
              <span class="app-sidebar__icon">{{ item.icon }}</span>
              <span class="app-sidebar__label">{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- 頁面內容 -->
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;

  &__body {
    display: flex;
    padding-top: $header-height;
    min-height: 100vh;
  }
}

.app-sidebar {
  width: $sidebar-width;
  flex-shrink: 0;
  background-color: $color-white;
  border-right: 1px solid $color-gray-200;
  padding: $spacing-4 0;
  position: fixed;
  top: $header-height;
  bottom: 0;
  overflow-y: auto;

  &__menu {
    list-style: none;
  }

  &__item {
    margin: $spacing-1 $spacing-2;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    padding: $spacing-2 $spacing-3;
    border-radius: $radius-md;
    text-decoration: none;
    color: $color-gray-600;
    font-size: $font-size-sm;
    font-weight: 500;
    transition: background-color $transition-fast, color $transition-fast;

    &:hover {
      background-color: $color-gray-100;
      color: $color-gray-900;
    }

    &--active {
      background-color: #ede9fe;
      color: $color-primary;
    }
  }

  &__icon {
    font-size: $font-size-base;
    width: 20px;
    text-align: center;
  }

  &__label {
    flex: 1;
  }
}

.app-main {
  flex: 1;
  margin-left: $sidebar-width;
  padding: $spacing-6;
  min-height: calc(100vh - $header-height);
  background-color: $color-gray-50;
}
</style>
