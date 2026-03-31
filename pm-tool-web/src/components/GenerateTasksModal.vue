<script setup>
import { ref, onMounted } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'
import apiClient from '@/lib/apiClient'

const props = defineProps({
  meetingId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['success', 'close'])
const meetingStore = useMeetingStore()

// ====== 使用者清單（供 assignee 下拉） ======
const users = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')

// ====== 任務輸入列，至少一筆 ======
const taskRows = ref([createEmptyRow()])

function createEmptyRow() {
  return { title: '', assigneeId: '', description: '', dueDate: '' }
}

const addRow = () => {
  taskRows.value.push(createEmptyRow())
}

const removeRow = (index) => {
  if (taskRows.value.length === 1) return // 最少保留一筆
  taskRows.value.splice(index, 1)
}

// ====== 驗證：每列 title + assigneeId 必填 ======
const validate = () => {
  for (let i = 0; i < taskRows.value.length; i++) {
    const row = taskRows.value[i]
    if (!row.title.trim()) return `第 ${i + 1} 筆任務請輸入標題`
    if (!row.assigneeId) return `第 ${i + 1} 筆任務請選擇負責人`
  }
  return null
}

// ====== 提交 ======
const handleSubmit = async () => {
  errorMessage.value = validate() ?? ''
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    const tasks = taskRows.value.map((row) => ({
      title: row.title,
      assigneeId: row.assigneeId,
      description: row.description || undefined,
      dueDate: row.dueDate || undefined,
    }))
    await meetingStore.generateTasks(props.meetingId, tasks)
    emit('success')
  } catch (error) {
    errorMessage.value = error.response?.data?.message ?? '建立任務失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}

// ====== 載入使用者清單 ======
onMounted(async () => {
  try {
    const { data } = await apiClient.get('/admin/users')
    users.value = data
  } catch (error) {
    console.error('取得使用者清單失敗:', error)
  }
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal modal--wide">
      <div class="modal__header">
        <h2>Generate Tasks</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </div>

      <div class="modal__body">
        <p class="generate-tasks__hint">
          從此會議批次建立任務。每筆需填寫標題與負責人，描述與截止日為選填。
        </p>

        <!-- 任務輸入列 -->
        <div
          v-for="(row, index) in taskRows"
          :key="index"
          class="generate-tasks__row"
        >
          <div class="generate-tasks__row-header">
            <span class="generate-tasks__row-index">任務 {{ index + 1 }}</span>
            <button
              v-if="taskRows.length > 1"
              class="generate-tasks__remove"
              type="button"
              @click="removeRow(index)"
            >
              ✕ 移除
            </button>
          </div>

          <div class="generate-tasks__fields">
            <div class="form-group">
              <label>標題 <span class="required">*</span></label>
              <input v-model="row.title" type="text" placeholder="任務標題" />
            </div>

            <div class="form-group">
              <label>負責人 <span class="required">*</span></label>
              <select v-model="row.assigneeId">
                <option value="">請選擇負責人</option>
                <option v-for="u in users" :key="u.id" :value="u.id">
                  {{ u.name }} ({{ u.role }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>描述</label>
              <input v-model="row.description" type="text" placeholder="任務描述（選填）" />
            </div>

            <div class="form-group">
              <label>截止日期</label>
              <input v-model="row.dueDate" type="date" />
            </div>
          </div>
        </div>

        <!-- 新增一筆 -->
        <button type="button" class="btn btn--secondary generate-tasks__add" @click="addRow">
          ＋ 新增一筆任務
        </button>

        <p v-if="errorMessage" class="form-error" style="margin-top: 0.75rem">
          {{ errorMessage }}
        </p>
      </div>

      <div class="modal__footer">
        <button class="btn btn--secondary" :disabled="isSubmitting" @click="emit('close')">
          取消
        </button>
        <button class="btn btn--primary" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '建立中...' : `建立 ${taskRows.length} 筆任務` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal--wide {
  max-width: 680px;
}

.generate-tasks {
  &__hint {
    font-size: $font-size-sm;
    color: $color-gray-500;
    margin-bottom: $spacing-4;
  }

  &__row {
    border: 1px solid $color-gray-200;
    border-radius: $radius-lg;
    padding: $spacing-4;
    margin-bottom: $spacing-4;
    background-color: $color-gray-50;
  }

  &__row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-3;
  }

  &__row-index {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $color-gray-700;
  }

  &__remove {
    background: none;
    border: none;
    font-size: $font-size-xs;
    color: $color-danger;
    cursor: pointer;
    padding: $spacing-1 $spacing-2;
    border-radius: $radius-sm;

    &:hover {
      background-color: #fee2e2;
    }
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 $spacing-4;

    .form-group {
      margin-bottom: $spacing-3;
    }
  }

  &__add {
    width: 100%;
    justify-content: center;
  }
}

.required {
  color: $color-danger;
}
</style>
