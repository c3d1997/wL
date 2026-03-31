import axios from 'axios'

// ====== 建立 Axios instance ======
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 設定 Axios interceptors，需在 authStore 初始化後呼叫
 * 避免循環引用（apiClient ↔ authStore）
 * @param {Object} authStore - useAuthStore() 的實例
 * @param {Object} router - Vue Router 實例
 */
export const setupInterceptors = (authStore, router) => {
  // ====== Request interceptor：自動帶入 accessToken ======
  apiClient.interceptors.request.use(
    (config) => {
      const token = authStore.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // ====== Response interceptor：401 自動 refresh 並重試原請求 ======
  let isRefreshing = false
  // 等待 refresh 完成的 pending queue
  let failedQueue = []

  /**
   * 清空 pending queue，依 refresh 結果 resolve 或 reject
   * @param {Error|null} error
   * @param {string|null} token
   */
  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // 非 401 或已是 retry 請求，直接拋出
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      // 若正在 refresh，將請求加入 queue 等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 呼叫 refresh，取得新的 accessToken
        const newToken = await authStore.refreshToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // refresh 失敗：清除 auth state，導向登入頁
        processQueue(refreshError, null)
        authStore.clearAuth()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
  )
}

export default apiClient
