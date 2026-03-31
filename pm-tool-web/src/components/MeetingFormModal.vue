<script setup>
import { ref, computed } from 'vue'
import { useMeetingStore } from '@/stores/meetingStore'

const props = defineProps({
  /** 傳入 meeting 代表編輯模式；null 代表新增模式 */
  meeting: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'close'])
const meetingStore = useMeetingStore()

const isEditMode = computed(() => !!props.meeting)

// ====== 表單欄位（編輯時預填） ======
const form = ref({
  title: props.meeting?.title ?? '',
  meetingDate: props.meeting?.meetingDate
    ? props.meeting.meetingDate.slice(0, 10)
    : '',
  content: props.meeting?.content ?? '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)

// ====== 驗證 ======
const validate = () => {
  if (!form.value.title.trim()) return '請輸入會議標題'
  if (!form.value.meetingDate) return '請選擇會議日期'
  if (!form.value.content.trim()) return '請輸入會議內容'
  return null
}

// ====== 提交 ======
const handleSubmit = async () => {
  errorMessage.value = validate() ?? ''
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    const payload = {
      title: form.value.title,
      meetingDate: form.value.meetingDate,
      content: form.value.content,
    }

    if (isEditMode.value) {
      await meetingStore.updateMeeting(props.meeting.id, payload)
    } else {
      await meetingStore.createMeeting(payload)
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
        <h2>{{ isEditMode ? '編輯會議' : '新增會議' }}</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </div>

      <form class="modal__body" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="meeting-title">會議標題 <span class="required">*</span></label>
          <input
            id="meeting-title"
            v-model="form.title"
            type="text"
            placeholder="輸入會議標題"
          />
        </div>

        <div class="form-group">
          <label for="meeting-date">會議日期 <span class="required">*</span></label>
          <input id="meeting-date" v-model="form.meetingDate" type="date" />
        </div>

        <div class="form-group">
          <label for="meeting-content">會議內容 <span class="required">*</span></label>
          <textarea
            id="meeting-content"
            v-model="form.content"
            placeholder="輸入會議記錄或議題"
            rows="6"
          />
        </div>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </form>

      <div class="modal__footer">
        <button class="btn btn--secondary" :disabled="isSubmitting" @click="emit('close')">
          取消
        </button>
        <button class="btn btn--primary" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? '儲存中...' : (isEditMode ? '儲存變更' : '新增會議') }}
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
