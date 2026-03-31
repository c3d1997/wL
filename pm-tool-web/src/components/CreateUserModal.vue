<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

const emit = defineEmits(['success', 'close'])
const adminStore = useAdminStore()

// ====== 角色選項 ======
const ROLES = [
  { value: 'admin', label: '管理員 (admin)' },
  { value: 'pm', label: '專案經理 (pm)' },
  { value: 'rd', label: '工程師 (rd)' },
]

// ====== 表單欄位 ======
const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'rd',
})

const errorMessage = ref('')
const isSubmitting = ref(false)

// ====== 驗證 ======
const validate = () => {
  if (!form.value.name.trim()) return '請輸入姓名'
  if (!form.value.email.trim()) return '請輸入 Email'
  if (!form.value.password) return '請輸入密碼'
  if (form.value.password.length < 6) return '密碼至少需要 6 個字元'
  if (!form.value.role) return '請選擇角色'
  return null
}

// ====== 提交 ======
const handleSubmit = async () => {
  errorMessage.value = validate() ?? ''
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    await adminStore.createUser({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
    })
    emit('success')
  } catch (error) {
    // 409 重複 email 或其他後端錯誤，顯示後端訊息
    errorMessage.value = error.response?.data?.message ?? '建立失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2>新增使用者</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </div>

      <form class="modal__body" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="user-name">姓名 <span class="required">*</span></label>
          <input
            id="user-name"
            v-model="form.name"
            type="text"
            placeholder="輸入姓名"
          />
        </div>

        <div class="form-group">
          <label for="user-email">Email <span class="required">*</span></label>
          <input
            id="user-email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label for="user-password">密碼 <span class="required">*</span></label>
          <input
            id="user-password"
            v-model="form.password"
            type="password"
            placeholder="至少 6 個字元"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="user-role">角色 <span class="required">*</span></label>
          <select id="user-role" v-model="form.role">
            <option v-for="r in ROLES" :key="r.value" :value="r.value">
              {{ r.label }}
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
          {{ isSubmitting ? '建立中...' : '建立使用者' }}
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
