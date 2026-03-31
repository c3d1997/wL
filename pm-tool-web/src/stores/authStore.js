import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'authUser'
const API_BASE = import.meta.env.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', () => {
  // ====== 狀態 ======
  // accessToken 存記憶體（降低 XSS 風險，15 分鐘短效）
  const accessToken = ref(null)
  // user 物件：{ id, name, email, role }
  const user = ref(null)

  // ====== Computed ======
  const isAuthenticated = computed(() => !!accessToken.value)
  const userRole = computed(() => user.value?.role ?? null)

  // ====== Actions ======

  /**
   * 登入：呼叫 POST /auth/login，儲存 token 與 user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password })
      accessToken.value = data.accessToken
      user.value = data.user
      // refreshToken 存 localStorage，跨頁面保留
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
      // user 存 localStorage，供頁面重整後還原顯示資訊用
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    } catch (error) {
      console.error('登入失敗:', error)
      throw error
    }
  }

  /**
   * 登出：呼叫 POST /auth/logout，清除所有 auth 狀態
   */
  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (storedRefreshToken && accessToken.value) {
        // 通知後端將 refreshToken 加入黑名單
        await axios.post(
          `${API_BASE}/auth/logout`,
          { refreshToken: storedRefreshToken },
          { headers: { Authorization: `Bearer ${accessToken.value}` } }
        )
      }
    } catch (error) {
      // logout API 失敗不阻擋前端清除流程
      console.error('登出 API 呼叫失敗:', error)
    } finally {
      clearAuth()
    }
  }

  /**
   * 用 refreshToken 換取新的 accessToken
   * @returns {Promise<string>} 新的 accessToken
   */
  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!storedRefreshToken) {
        throw new Error('找不到 refreshToken')
      }
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      })
      accessToken.value = data.accessToken
      return data.accessToken
    } catch (error) {
      console.error('Token refresh 失敗:', error)
      clearAuth()
      throw error
    }
  }

  /**
   * 頁面重整後嘗試還原 session
   * 若 localStorage 中有 refreshToken，自動換取新的 accessToken 並還原 user 資訊
   */
  const restoreSession = async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefreshToken) return

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      })
      accessToken.value = data.accessToken

      // 從 localStorage 還原 user 物件（user 資訊不會因 refresh 改變）
      const savedUser = localStorage.getItem(USER_KEY)
      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }
    } catch (error) {
      // refresh 失敗：session 已過期，清除殘留資料
      console.error('Session 還原失敗:', error)
      clearAuth()
    }
  }

  /**
   * 清除所有 auth 狀態（記憶體 + localStorage）
   */
  const clearAuth = () => {
    accessToken.value = null
    user.value = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    refreshToken,
    restoreSession,
    clearAuth,
  }
})
