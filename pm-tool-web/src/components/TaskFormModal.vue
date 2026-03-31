<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import apiClient from '@/lib/apiClient'

const props = defineProps({
  /** 傳入 task 代表編輯模式；null 代表新增模式 */
  task: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'close'])

const authStore = useAuthStore()
const taskStore = useTaskStore()

const isEditMode = computed(() => !!props.task)
const isPmOrAdmin = ['pm', 'admin'].includes(authStore.userRole)

// ====== 表單欄位 ======
const form = ref({
  title: props.task?.title ?? '',
  description: props.task?.description ?? '',
  assigneeId: props.task?.assigneeId ?? '',
  dueDate: props.task?.dueDate ? props.task.dueDate.slice(0, 10) : '',
  meetingId: props.task?.meetingId ?? '',
  status: props.task?.status ?? 'pending',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
const users = ref([])   // 供 assignee 下拉選單使用

// ====== 載入使用者清單（PM/admin 建立任務時需要） ======
onMounted(async () => {
  if (isPmOrAdmin) {
    try {
      const { data } = await apiClient.get('/admin/users')
      users.value = data
    } catch (error) {
      console.error('取得使用者清單失敗:', error)
    }
  }
})

// ====== 表單驗證 ======
const validate = () => {
  if (isPmOrAdmin) {
    if (!form.value.title.trim()) return '請輸入任務標題'
    if (!form.value.assigneeId) return '請選擇負責人'
  }
  return null
}

// ====== 提交 ======
const handleSubmit = async () => {
  errorMessage.value = validate() ?? ''
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      // 編輯：PM 傳所有欄位，RD 只傳 status
      const payload = isPmOrAdmin
        ? {
            title: form.value.title,
            description: form.value.description || undefined,
            assigneeId: form.value.assigneeId,
            dueDate: form.value.dueDate || undefined,
            meetingId: form.value.meetingId || undefined,
            status: form.value.status,
          }
        : { status: form.value.status }

      await taskStore.updateTask(props.task.id, payload)
    } else {
      // 新增
      await taskStore.createTask({
        title: form.value.title,
        description: form.value.description || undefined,
        assigneeId: form.value.assigneeId,
        dueDate: form.value.dueDate || undefined,
        meetingId: form.value.meetingId || undefined,
      })
    }
    emit('success')
  } catch (error) {
    errorMessage.value = error.response?.data?.message ?? '操作失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2>{{ isEditMode ? '編輯任務' : '新增任務' }}</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </div>

      <form class="modal__body" @submit.prevent="handleSubmit">
        <!-- PM/admin 顯示完整欄位 -->
        <template v-if="isPmOrAdmin">
          <div class="form-group">
            <label for="task-title">任務標題 <span class="required">*</span></label>
            <input id="task-title" v-model="form.title" type="text" placeholder="輸入任務標題" />
          </div>

          <div class="form-group">
            <label for="task-desc">描述</label>
            <textarea id="task-desc" v-model="form.description" placeholder="任務描述（選填）" />
          </div>

          <div class="form-group">
            <label for="task-assignee">負責人 <span class="required">*</span></label>
            <select id="task-assignee" v-model="form.assigneeId">
              <option value="">請選擇負責人</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.role }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="task-due">截止日期</label>
            <input id="task-due" v-model="form.dueDate" type="date" />
          </div>

          <div v-if="isEditMode" class="form-group">
            <label for="task-status">狀態</label>
            <select id="task-status" v-model="form.status">
              <option value="pending">待處理</option>
              <option value="in_progress">進行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </template>

        <!-- RD 只顯示 status 欄位 -->
        <template v-else>
          <div class="form-group">
            <label for="task-status-rd">更新狀態</label>
            <select id="task-status-rd" v-model="form.status">
              <option value="pending">待處理</option>
              <option value="in_progress">進行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
        </template>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </form>

      <div class="modal__footer">
        <button class="btn btn--secondary" :disabled="isSubmitting" @click="emit('close')">
          取消
        </button>
        <button class="btn btn--primary" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '儲存中...' : (isEditMode ? '儲存變更' : '新增任務') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.required {
  color: $color-danger;
}
</style>
