<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMeetingStore } from '@/stores/meetingStore'
import MeetingFormModal from '@/components/MeetingFormModal.vue'
import GenerateTasksModal from '@/components/GenerateTasksModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const meetingStore = useMeetingStore()

const isPmOrAdmin = ['pm', 'admin'].includes(authStore.userRole)

// ====== Modal 狀態 ======
const showEditModal = ref(false)
const showGenerateModal = ref(false)
const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')
const notFound = ref(false)

// ====== 日期格式化 ======
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ====== 刪除 ======
const confirmDelete = async () => {
  isDeleting.value = true
  deleteError.value = ''
  try {
    await meetingStore.deleteMeeting(route.params.id)
    router.push('/meetings')
  } catch (error) {
    deleteError.value = error.response?.data?.message ?? '刪除失敗，請稍後再試'
  } finally {
    isDeleting.value = false
  }
}

// ====== 初始化 ======
onMounted(async () => {
  try {
    await meetingStore.fetchMeeting(route.params.id)
  } catch (error) {
    if (error.response?.status === 404) {
      notFound.value = true
    } else {
      console.error('取得會議詳情失敗:', error)
    }
  }
})
</script>

<template>
  <!-- 404 -->
  <div v-if="notFound" class="empty-state">
    <span class="empty-state__icon">🔍</span>
    <p class="empty-state__text">找不到此會議，可能已被刪除。</p>
    <RouterLink to="/meetings" class="btn btn--secondary" style="margin-top: 1rem">
      返回會議列表
    </RouterLink>
  </div>

  <!-- 載入中 -->
  <div v-else-if="meetingStore.isLoading" class="loading">載入中...</div>

  <!-- 會議詳情 -->
  <div v-else-if="meetingStore.currentMeeting" class="meeting-detail">
    <!-- 標題列 -->
    <div class="meeting-detail__header">
      <div>
        <button class="btn btn--secondary btn--sm" @click="router.push('/meetings')">
          ← 返回
        </button>
        <h1 class="meeting-detail__title">{{ meetingStore.currentMeeting.title }}</h1>
        <p class="meeting-detail__meta">
          會議日期：{{ formatDate(meetingStore.currentMeeting.meetingDate) }}
          ・建立者：{{ meetingStore.currentMeeting.createdBy?.name ?? '—' }}
        </p>
      </div>

      <!-- PM/admin 操作按鈕 -->
      <div v-if="isPmOrAdmin" class="meeting-detail__actions">
        <button class="btn btn--secondary" @click="showEditModal = true">編輯</button>
        <button class="btn btn--primary" @click="showGenerateModal = true">Generate Tasks</button>
        <button class="btn btn--danger" @click="showDeleteDialog = true">刪除</button>
      </div>
    </div>

    <!-- 會議內容 -->
    <div class="meeting-detail__section">
      <h2 class="meeting-detail__section-title">會議記錄</h2>
      <div class="meeting-detail__content">
        {{ meetingStore.currentMeeting.content || '（無內容）' }}
      </div>
    </div>

    <!-- 關聯任務 -->
    <div class="meeting-detail__section">
      <h2 class="meeting-detail__section-title">
        關聯任務（{{ meetingStore.currentMeeting.tasks?.length ?? 0 }}）
      </h2>

      <div v-if="meetingStore.currentMeeting.tasks?.length > 0" class="task-table-wrap">
        <table class="task-table">
          <thead>
            <tr>
              <th>任務標題</th>
              <th>狀態</th>
              <th>負責人</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in meetingStore.currentMeeting.tasks"
              :key="task.id"
            >
              <td>{{ task.title }}</td>
              <td>
                <span :class="`badge badge--${task.status}`">
                  {{ { pending: '待處理', in_progress: '進行中', done: '已完成' }[task.status] }}
                </span>
              </td>
              <td>{{ task.assignee?.name ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state" style="padding: 2rem">
        <p class="empty-state__text">此會議尚無關聯任務</p>
      </div>
    </div>

    <!-- 編輯 Modal -->
    <MeetingFormModal
      v-if="showEditModal"
      :meeting="meetingStore.currentMeeting"
      @success="showEditModal = false"
      @close="showEditModal = false"
    />

    <!-- Generate Tasks Modal -->
    <GenerateTasksModal
      v-if="showGenerateModal"
      :meeting-id="meetingStore.currentMeeting.id"
      @success="showGenerateModal = false"
      @close="showGenerateModal = false"
    />

    <!-- 刪除確認 Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay">
      <div class="confirm-dialog">
        <h3 class="confirm-dialog__title">確認刪除</h3>
        <p class="confirm-dialog__message">
          確定要刪除會議「{{ meetingStore.currentMeeting.title }}」嗎？
          關聯任務將保留但解除與會議的連結。
        </p>
        <p v-if="deleteError" class="form-error">{{ deleteError }}</p>
        <div class="confirm-dialog__actions">
          <button class="btn btn--secondary" :disabled="isDeleting" @click="showDeleteDialog = false">
            取消
          </button>
          <button class="btn btn--danger" :disabled="isDeleting" @click="confirmDelete">
            {{ isDeleting ? '刪除中...' : '確認刪除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.meeting-detail {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-4;
    margin-bottom: $spacing-6;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-gray-900;
    margin-top: $spacing-3;
    margin-bottom: $spacing-1;
  }

  &__meta {
    font-size: $font-size-sm;
    color: $color-gray-500;
  }

  &__actions {
    display: flex;
    gap: $spacing-2;
    flex-shrink: 0;
    padding-top: $spacing-8;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    padding: $spacing-5;
    margin-bottom: $spacing-5;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-gray-800;
    margin-bottom: $spacing-4;
    padding-bottom: $spacing-3;
    border-bottom: 1px solid $color-gray-200;
  }

  &__content {
    font-size: $font-size-sm;
    color: $color-gray-700;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.task-table-wrap {
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;

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

  tr:last-child td {
    border-bottom: none;
  }
}
</style>
