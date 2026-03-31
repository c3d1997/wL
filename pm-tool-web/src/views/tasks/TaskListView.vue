<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import TaskFormModal from '@/components/TaskFormModal.vue'

const authStore = useAuthStore()
const taskStore = useTaskStore()

// ====== 狀態 ======
const showFormModal = ref(false)
const editingTask = ref(null)       // null = 新增；task object = 編輯
const showDeleteDialog = ref(false)
const deletingTask = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

// 角色判斷
const isPmOrAdmin = ['pm', 'admin'].includes(authStore.userRole)

// ====== 狀態篩選選項 ======
const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待處理' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '已完成' },
]

// ====== 日期格式化 ======
/**
 * @param {string|null} dateStr
 * @returns {string}
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// ====== Modal 操作 ======
const openCreate = () => {
  editingTask.value = null
  showFormModal.value = true
}

const openEdit = (task) => {
  editingTask.value = task
  showFormModal.value = true
}

const onFormSuccess = () => {
  showFormModal.value = false
}

// ====== 刪除操作 ======
const openDeleteDialog = (task) => {
  deletingTask.value = task
  deleteError.value = ''
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingTask.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await taskStore.deleteTask(deletingTask.value.id)
    showDeleteDialog.value = false
    deletingTask.value = null
  } catch (error) {
    deleteError.value = error.response?.data?.message ?? '刪除失敗，請稍後再試'
  } finally {
    isDeleting.value = false
  }
}

// ====== 初始化 ======
onMounted(async () => {
  await taskStore.fetchTasks()
})
</script>

<template>
  <div class="task-list">
    <!-- 頁面標題列 -->
    <div class="task-list__header">
      <h1 class="task-list__title">任務管理</h1>
      <button v-if="isPmOrAdmin" class="btn btn--primary" @click="openCreate">
        ＋ 新增任務
      </button>
    </div>

    <!-- 狀態篩選器 -->
    <div class="task-list__filters">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="task-list__filter-btn"
        :class="{ 'task-list__filter-btn--active': taskStore.statusFilter === opt.value }"
        @click="taskStore.statusFilter = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="taskStore.isLoading" class="loading">載入中...</div>

    <!-- 任務列表 -->
    <div v-else-if="taskStore.filteredTasks.length > 0" class="task-list__table-wrap">
      <table class="task-table">
        <thead>
          <tr>
            <th>任務標題</th>
            <th>狀態</th>
            <th>負責人</th>
            <th>截止日</th>
            <th>關聯會議</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in taskStore.filteredTasks" :key="task.id" class="task-table__row">
            <td class="task-table__title">{{ task.title }}</td>
            <td>
              <span :class="`badge badge--${task.status}`">
                {{ { pending: '待處理', in_progress: '進行中', done: '已完成' }[task.status] }}
              </span>
            </td>
            <td>{{ task.assignee?.name ?? '—' }}</td>
            <td>{{ formatDate(task.dueDate) }}</td>
            <td>{{ task.meeting?.title ?? '—' }}</td>
            <td class="task-table__actions">
              <!-- PM/admin：顯示編輯與刪除 -->
              <template v-if="isPmOrAdmin">
                <button class="btn btn--secondary btn--sm" @click="openEdit(task)">編輯</button>
                <button class="btn btn--danger btn--sm" @click="openDeleteDialog(task)">刪除</button>
              </template>
              <!-- RD：只顯示狀態下拉（直接更新） -->
              <template v-else>
                <select
                  :value="task.status"
                  class="task-table__status-select"
                  @change="(e) => taskStore.updateTask(task.id, { status: e.target.value })"
                >
                  <option value="pending">待處理</option>
                  <option value="in_progress">進行中</option>
                  <option value="done">已完成</option>
                </select>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">📋</span>
      <p class="empty-state__text">目前沒有符合條件的任務</p>
    </div>

    <!-- 建立 / 編輯 Modal -->
    <TaskFormModal
      v-if="showFormModal"
      :task="editingTask"
      @success="onFormSuccess"
      @close="showFormModal = false"
    />

    <!-- 刪除確認 Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay">
      <div class="confirm-dialog">
        <h3 class="confirm-dialog__title">確認刪除</h3>
        <p class="confirm-dialog__message">
          確定要刪除任務「{{ deletingTask?.title }}」嗎？此動作無法復原。
        </p>
        <p v-if="deleteError" class="form-error">{{ deleteError }}</p>
        <div class="confirm-dialog__actions">
          <button
            class="btn btn--secondary"
            :disabled="isDeleting"
            @click="showDeleteDialog = false"
          >
            取消
          </button>
          <button
            class="btn btn--danger"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            {{ isDeleting ? '刪除中...' : '確認刪除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-list {
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

  &__filters {
    display: flex;
    gap: $spacing-2;
    margin-bottom: $spacing-4;
  }

  &__filter-btn {
    padding: $spacing-1 $spacing-3;
    border: 1px solid $color-gray-300;
    border-radius: $radius-full;
    background: $color-white;
    font-size: $font-size-sm;
    color: $color-gray-600;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    &--active {
      background-color: $color-primary;
      border-color: $color-primary;
      color: $color-white;
    }
  }

  &__table-wrap {
    overflow-x: auto;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }
}

.task-table {
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

  &__title {
    font-weight: 500;
    color: $color-gray-900;
  }

  &__actions {
    display: flex;
    gap: $spacing-2;
    white-space: nowrap;
  }

  &__status-select {
    padding: $spacing-1 $spacing-2;
    border: 1px solid $color-gray-300;
    border-radius: $radius-md;
    font-size: $font-size-xs;
    color: $color-gray-700;
    background-color: $color-white;
    cursor: pointer;
  }
}
</style>
