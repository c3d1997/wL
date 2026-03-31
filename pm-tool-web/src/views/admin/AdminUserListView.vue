<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import CreateUserModal from '@/components/CreateUserModal.vue'

const adminStore = useAdminStore()

const showCreateModal = ref(false)

// ====== 角色選項 ======
const ROLES = ['admin', 'pm', 'rd']

const roleLabel = {
  admin: '管理員',
  pm: '專案經理',
  rd: '工程師',
}

// ====== Inline 角色變更 ======
// 儲存各使用者目前選擇中的 role，用於 pending 狀態管理
const updatingId = ref(null)
const updateError = ref('')

/**
 * 選單變更時直接呼叫 API 更新角色
 * @param {string} userId
 * @param {string} newRole
 */
const handleRoleChange = async (userId, newRole) => {
  updatingId.value = userId
  updateError.value = ''
  try {
    await adminStore.updateUserRole(userId, newRole)
  } catch (error) {
    updateError.value = error.response?.data?.message ?? '更新角色失敗'
    // 重新拉取確保 UI 與伺服器一致
    await adminStore.fetchUsers()
  } finally {
    updatingId.value = null
  }
}

// ====== 日期格式化 ======
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

onMounted(async () => {
  await adminStore.fetchUsers()
})
</script>

<template>
  <div class="admin-users">
    <div class="admin-users__header">
      <h1 class="admin-users__title">使用者管理</h1>
      <button class="btn btn--primary" @click="showCreateModal = true">
        ＋ 新增使用者
      </button>
    </div>

    <!-- 全域錯誤提示 -->
    <p v-if="updateError" class="form-error admin-users__error">{{ updateError }}</p>

    <!-- 載入中 -->
    <div v-if="adminStore.isLoading" class="loading">載入中...</div>

    <!-- 使用者列表 -->
    <div v-else-if="adminStore.users.length > 0" class="admin-users__table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>Email</th>
            <th>角色</th>
            <th>建立日期</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in adminStore.users"
            :key="user.id"
            class="user-table__row"
          >
            <td class="user-table__name">{{ user.name }}</td>
            <td class="user-table__email">{{ user.email }}</td>
            <td>
              <!-- Inline role 選擇器：選單直接更新 -->
              <div class="user-table__role-wrap">
                <span :class="`badge badge--${user.role}`">
                  {{ roleLabel[user.role] ?? user.role }}
                </span>
                <select
                  :value="user.role"
                  class="user-table__role-select"
                  :disabled="updatingId === user.id"
                  @change="(e) => handleRoleChange(user.id, e.target.value)"
                >
                  <option v-for="r in ROLES" :key="r" :value="r">
                    {{ roleLabel[r] }}
                  </option>
                </select>
                <span v-if="updatingId === user.id" class="user-table__updating">
                  更新中...
                </span>
              </div>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">👥</span>
      <p class="empty-state__text">目前沒有使用者</p>
    </div>

    <!-- 建立使用者 Modal -->
    <CreateUserModal
      v-if="showCreateModal"
      @success="showCreateModal = false"
      @close="showCreateModal = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.admin-users {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-5;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-gray-900;
  }

  &__error {
    margin-bottom: $spacing-4;
    padding: $spacing-3;
    background-color: #fee2e2;
    border-radius: $radius-md;
  }

  &__table-wrap {
    overflow-x: auto;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: $color-white;

  th, td {
    padding: $spacing-3 $spacing-4;
    text-align: left;
    font-size: $font-size-sm;
    border-bottom: 1px solid $color-gray-200;
  }

  th {
    font-weight: 600;
    color: $color-gray-500;
    background-color: $color-gray-50;
  }

  &__row:last-child td {
    border-bottom: none;
  }

  &__row:hover td {
    background-color: $color-gray-50;
  }

  &__name {
    font-weight: 500;
    color: $color-gray-900;
  }

  &__email {
    color: $color-gray-600;
  }

  &__role-wrap {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__role-select {
    padding: $spacing-1 $spacing-2;
    border: 1px solid $color-gray-300;
    border-radius: $radius-md;
    font-size: $font-size-xs;
    color: $color-gray-700;
    background-color: $color-white;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__updating {
    font-size: $font-size-xs;
    color: $color-gray-400;
  }
}
</style>
