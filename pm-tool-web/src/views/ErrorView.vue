<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  /** 錯誤代碼，支援 403 / 404 */
  code: {
    type: Number,
    default: 404,
  },
})

const router = useRouter()

const errorInfo = computed(() => {
  if (props.code === 403) {
    return {
      icon: '🚫',
      title: '403 — 無存取權限',
      message: '你沒有權限存取此頁面。請確認你的角色是否有此功能的存取權。',
    }
  }
  return {
    icon: '🔍',
    title: '404 — 找不到頁面',
    message: '你所尋找的頁面不存在，可能已被移除或網址有誤。',
  }
})
</script>

<template>
  <div class="error-page">
    <div class="error-page__content">
      <span class="error-page__icon">{{ errorInfo.icon }}</span>
      <h1 class="error-page__title">{{ errorInfo.title }}</h1>
      <p class="error-page__message">{{ errorInfo.message }}</p>
      <button class="btn btn--primary" @click="router.back()">
        回上一頁
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-gray-50;

  &__content {
    text-align: center;
    max-width: 480px;
    padding: $spacing-8;
  }

  &__icon {
    display: block;
    font-size: 4rem;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-gray-800;
    margin-bottom: $spacing-3;
  }

  &__message {
    font-size: $font-size-base;
    color: $color-gray-500;
    margin-bottom: $spacing-6;
    line-height: 1.6;
  }
}
</style>
