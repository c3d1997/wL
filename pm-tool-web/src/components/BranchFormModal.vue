<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBranchStore } from '@/stores/branchStore'
import apiClient from '@/lib/apiClient'

const props = defineProps({
  /** 傳入 branch 代表編輯模式；null 代表新增模式 */
  branch: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'close'])
const branchStore = useBranchStore()

const isEditMode = computed(() => !!props.branch)

// ====== 分支類型選項 ======
const BRANCH_TYPES = [
  { value: 'feat', label: 'feat — 新功能' },
  { value: 'fix', label: 'fix — 修復' },
  { value: 'hotfix', label: 'hotfix — 緊急修復' },
  { value: 'update', label: 'update — 更新' },
  { value: 'chore', label: 'chore — 雜務' },
]

// ====== 表單欄位 ======
const form = ref({
  name: props.branch?.name ?? '',
  type: props.branch?.type ?? '',
  taskId: props.branch?.taskId ?? '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)
// 僅新增模式需要選 taskId；編輯只能改 name 與 type（spec 限制）
const assignedTasks = ref([])

// ====== 載入已指派給自己的任務（新增模式） ======
onMounted(async () => {
  if (!isEditMode.value) {
    try {
      const { data } = await apiClient.get('/tasks')
      // RD 的 /tasks 只回傳自己的，直接使用
      assignedTasks.value = data
    } catch (error) {
      console.error('取得任務清單失敗:', error)
    }
  }
})

// ====== 驗證 ======
const validate = () => {
  if (!form.value.name.trim()) return '請輸入分支名稱'
  if (!form.value.type) return '請選擇分支類型'
  if (!isEditMode.value && !form.value.taskId) return '請選擇關聯任務'
  return null
}

// ====== 提交 ======
const handleSubmit = async () => {
  errorMessage.value = validate() ?? ''
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      // 編輯：只傳 name 與 type
      await branchStore.updateBranch(props.branch.id, {
        name: form.value.name,
        type: form.value.type,
      })
    } else {
      await branchStore.createBranch({
        name: form.value.name,
        type: form.value.type,
        taskId: form.value.taskId,
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
        <h2>{{ isEditMode ? '編輯分支' : '新增分支' }}</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </div>

      <form class="modal__body" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="branch-name">分支名稱 <span class="required">*</span></label>
          <input
            id="branch-name"
            v-model="form.name"
            type="text"
            placeholder="例：feat/user-login"
          />
        </div>

        <div class="form-group">
          <label for="branch-type">分支類型 <span class="required">*</span></label>
          <select id="branch-type" v-model="form.type">
            <option value="">請選擇類型</option>
            <option
              v-for="opt in BRANCH_TYPES"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 新增模式才顯示關聯任務選擇 -->
        <div v-if="!isEditMode" class="form-group">
          <label for="branch-task">關聯任務 <span class="required">*</span></label>
          <select id="branch-task" v-model="form.taskId">
            <option value="">請選擇任務</option>
            <option
              v-for="task in assignedTasks"
              :key="task.id"
              :value="task.id"
            >
              {{ task.title }}
            </option>
          </select>
        </div>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </form>

      <div class="modal__footer">
        <button class="btn btn--secondary" :disabled="isSubmitting" @click="emit('close')">
          取消
        </button>
        <button class="btn btn--primary" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '儲存中...' : (isEditMode ? '儲存變更' : '新增分支') }}
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
