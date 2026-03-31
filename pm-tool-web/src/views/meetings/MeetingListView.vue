<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMeetingStore } from '@/stores/meetingStore'
import MeetingFormModal from '@/components/MeetingFormModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const meetingStore = useMeetingStore()

const isPmOrAdmin = ['pm', 'admin'].includes(authStore.userRole)

// ====== Modal 狀態 ======
const showFormModal = ref(false)
const showDeleteDialog = ref(false)
const deletingMeeting = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

// ====== 日期格式化 ======
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// ====== 刪除 ======
const openDeleteDialog = (meeting) => {
  deletingMeeting.value = meeting
  deleteError.value = ''
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingMeeting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await meetingStore.deleteMeeting(deletingMeeting.value.id)
    showDeleteDialog.value = false
    deletingMeeting.value = null
  } catch (error) {
    deleteError.value = error.response?.data?.message ?? '刪除失敗，請稍後再試'
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await meetingStore.fetchMeetings()
})
</script>

<template>
  <div class="meeting-list">
    <div class="meeting-list__header">
      <h1 class="meeting-list__title">會議管理</h1>
      <button v-if="isPmOrAdmin" class="btn btn--primary" @click="showFormModal = true">
        ＋ 新增會議
      </button>
    </div>

    <!-- 載入中 -->
    <div v-if="meetingStore.isLoading" class="loading">載入中...</div>

    <!-- 會議列表 -->
    <div v-else-if="meetingStore.meetings.length > 0" class="meeting-list__table-wrap">
      <table class="meeting-table">
        <thead>
          <tr>
            <th>會議標題</th>
            <th>會議日期</th>
            <th>建立者</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="meeting in meetingStore.meetings"
            :key="meeting.id"
            class="meeting-table__row"
          >
            <td class="meeting-table__title">
              <RouterLink :to="`/meetings/${meeting.id}`" class="meeting-table__link">
                {{ meeting.title }}
              </RouterLink>
            </td>
            <td>{{ formatDate(meeting.meetingDate) }}</td>
            <td>{{ meeting.createdBy?.name ?? '—' }}</td>
            <td class="meeting-table__actions">
              <button
                class="btn btn--secondary btn--sm"
                @click="router.push(`/meetings/${meeting.id}`)"
              >
                詳情
              </button>
              <button
                v-if="isPmOrAdmin"
                class="btn btn--danger btn--sm"
                @click="openDeleteDialog(meeting)"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <span class="empty-state__icon">📅</span>
      <p class="empty-state__text">目前沒有會議記錄</p>
    </div>

    <!-- 新增 Modal -->
    <MeetingFormModal
      v-if="showFormModal"
      :meeting="null"
      @success="showFormModal = false"
      @close="showFormModal = false"
    />

    <!-- 刪除確認 Dialog -->
    <div v-if="showDeleteDialog" class="modal-overlay">
      <div class="confirm-dialog">
        <h3 class="confirm-dialog__title">確認刪除</h3>
        <p class="confirm-dialog__message">
          確定要刪除會議「{{ deletingMeeting?.title }}」嗎？關聯任務將保留但解除與會議的連結。
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
.meeting-list {
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

.meeting-table {
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
  }

  &__link {
    color: $color-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-2;
  }
}
</style>
