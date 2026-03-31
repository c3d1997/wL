<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// ====== 表單狀態 ======
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

/**
 * 提交登入表單
 */
const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push('/tasks')
  } catch (error) {
    // 顯示後端回傳的錯誤訊息，失敗後不清空表單
    errorMessage.value =
      error.response?.data?.message ?? '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">PM Tool</h1>
        <p class="login-card__subtitle">請登入以繼續</p>
      </div>

      <form class="login-card__form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="請輸入密碼"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- 錯誤訊息：失敗後顯示，不清空表單 -->
        <p v-if="errorMessage" class="login-card__error">{{ errorMessage }}</p>

        <button
          type="submit"
          class="btn btn--primary login-card__submit"
          :disabled="isLoading"
        >
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-gray-100;
}

.login-card {
  background-color: $color-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-8;
  width: 100%;
  max-width: 400px;

  &__header {
    text-align: center;
    margin-bottom: $spacing-6;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: $spacing-1;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-gray-500;
  }

  &__form {
    display: flex;
    flex-direction: column;
  }

  &__error {
    font-size: $font-size-sm;
    color: $color-danger;
    margin-bottom: $spacing-3;
    padding: $spacing-2 $spacing-3;
    background-color: #fee2e2;
    border-radius: $radius-md;
  }

  &__submit {
    width: 100%;
    justify-content: center;
    padding: $spacing-3;
    font-size: $font-size-base;
  }
}
</style>
