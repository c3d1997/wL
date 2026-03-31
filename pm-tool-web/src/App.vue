<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { setupInterceptors } from '@/lib/apiClient'

const router = useRouter()
const authStore = useAuthStore()

// ====== 初始化 Axios interceptors ======
// 需在 authStore、router 都就緒後才設定，避免循環引用
setupInterceptors(authStore, router)

// ====== 頁面重整後自動還原 session ======
onMounted(async () => {
  await authStore.restoreSession()
})
</script>

<template>
  <RouterView />
</template>
