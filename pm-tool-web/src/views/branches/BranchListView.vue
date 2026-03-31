<script setup>
import { ref, onMounted } from 'vue'
import { useBranchStore } from '@/stores/branchStore'
import BranchFormModal from '@/components/BranchFormModal.vue'

const branchStore = useBranchStore()

// ====== Modal 狀態 ======
const showFormModal = ref(false)
const editingBranch = ref(null)   // null = 新增；branch object = 編輯
const showDeleteDialog = ref(false)
const deletingBranch = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

// ====== 分支類型對應中文標籤 ======
const branchTypeLabel = {
  feat: '功能',
  fix: '修復',
  hotfix: '緊急修復',
  update: '更新',
  chore: '雜務',
}

// ====== Modal 操作 ======
const openCreate = () => {
  editingBranch.value = null
  showFormModal.value = true
}

const openEdit = (branch) => {
  editingBranch.value = branch
  showFormModal.value = true
}

// ====== 刪除 ======
const openDeleteDialog = (branch) => {
  deletingBranch.value = branch
  deleteError.value = ''
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingBranch.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await branchStore.deleteBranch(deletingBranch.value.id)
    showDeleteDialog.value = false
    deletingBranch.value = null
  } catch (error) {
    deleteError.value = error.response?.data?.message ?? '刪除失敗，請稍後再試'
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await branchStore.fetchBranches()
})
</script>

<template>
  <div class="branch-list">
    <div class="branch-list__header">
      <h1 class="branch-list__title">分支管理</h1>
      <button class="btn btn--primary" @click="openCreate">
        ＋ 新增分支
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="branchStore.isLoading" class="loading">載入中...</div>

    <!-- 分支列表 -->
    <div v-else-if="branchStore.branches.length > 0" class="branch-list__table-wrap">
      <table class="branch-table">
        <thead>
          <tr>
            <th>分支名稱</th>
            <th>類型</th>
            <th>關聯任務</th>
            <th>任務狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="branch in branchStore.branches"
            :key="branch.id"
            class="branch-table__row"
          >
            <td class="branch-table__name">
              <code>{{ branch.name }}</code>
            </td>
            <td>
              <span :class="`badge badge--${branch.type}`">
                {{ branchTypeLabel[branch.type] ?? branch.type }}
              </span>
            </td>
            <td>{{ branch.task?.title ?? '—' }}</td>
            <td>
              <span
                v-if="branch.task"
                :class="`badge badge--${branch.task.status}`"
              >
                {{ { pending: '待處理', in_progress: '進行中', done: '已完成' }[branch.task.status] }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="branch-table__actions">
              <button class="btn btn--secondary btn--sm" @click="openEdit(branch)">
                編輯
              </button>
              <button class="btn btn--danger btn--sm" @click="openDeleteDialog(branch)">
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">🌿</span>
      <p class="empty-state__text">你目前沒有分支記錄</p>
    </div>

    <!-- 新增 / 編輯 Modal -->
    <BranchFormModal
      v-if="showFormModal"
      :branch="editingBranch"
      @success="showFormModal = false"
      @close="showFormModal = false"
    />

    <!-- 刪除確認 Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay">
      <div class="confirm-dialog">
        <h3 class="confirm-dialog__title">確認刪除</h3>
        <p class="confirm-dialog__message">
          確定要刪除分支「{{ deletingBranch?.name }}」嗎？此動作無法復原。
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
.branch-list {
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

  &__table-wrap {
    overflow-x: auto;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }
}

.branch-table {
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

  &__name code {
    background-color: $color-gray-100;
    padding: $spacing-1 $spacing-2;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    color: $color-gray-800;
    font-family: 'SFMono-Regular', Consolas, monospace;
  }

  &__actions {
    display: flex;
    gap: $spacing-2;
  }
}
</style>
