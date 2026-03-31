import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/lib/apiClient'

export const useNotificationStore = defineStore('notification', () => {
  // ====== 狀態 ======
  const notifications = ref([])
  const isLoading = ref(false)

  // ====== Computed ======
  /**
   * 未讀通知數，供 AppHeader badge 使用
   */
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.isRead).length
  )

  // ====== Actions ======

  /**
   * 取得通知列表（後端依 newest first 排序）
   */
  const fetchNotifications = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/notifications')
      notifications.value = data
    } catch (error) {
      console.error('取得通知失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 標記單筆通知為已讀
   * @param {string} id
   */
  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`)
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.isRead = true
      }
    } catch (error) {
      console.error('標記已讀失敗:', error)
      throw error
    }
  }

  /**
   * 標記所有通知為已讀
   */
  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all')
      notifications.value.forEach((n) => {
        n.isRead = true
      })
    } catch (error) {
      console.error('全部標記已讀失敗:', error)
      throw error
    }
  }

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
})
