import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/lib/apiClient'

export const useMeetingStore = defineStore('meeting', () => {
  // ====== 狀態 ======
  const meetings = ref([])
  const currentMeeting = ref(null) // 目前開啟的會議詳情
  const isLoading = ref(false)

  // ====== Actions ======

  /**
   * 取得會議列表（所有已登入使用者）
   */
  const fetchMeetings = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/meetings')
      meetings.value = data
    } catch (error) {
      console.error('取得會議列表失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 取得單一會議詳情（含關聯任務）
   * @param {string} id
   */
  const fetchMeeting = async (id) => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get(`/meetings/${id}`)
      currentMeeting.value = data
      return data
    } catch (error) {
      console.error('取得會議詳情失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 建立新會議（PM/admin）
   * @param {Object} payload - { title, meetingDate, content }
   */
  const createMeeting = async (payload) => {
    try {
      const { data } = await apiClient.post('/meetings', payload)
      meetings.value.unshift(data)
      return data
    } catch (error) {
      console.error('建立會議失敗:', error)
      throw error
    }
  }

  /**
   * 更新會議（PM/admin）
   * @param {string} id
   * @param {Object} payload
   */
  const updateMeeting = async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`/meetings/${id}`, payload)
      // 更新列表中的資料
      const index = meetings.value.findIndex((m) => m.id === id)
      if (index !== -1) meetings.value[index] = data
      // 若目前詳情頁是同一筆，一起更新
      if (currentMeeting.value?.id === id) currentMeeting.value = data
      return data
    } catch (error) {
      console.error('更新會議失敗:', error)
      throw error
    }
  }

  /**
   * 刪除會議（PM/admin）
   * @param {string} id
   */
  const deleteMeeting = async (id) => {
    try {
      await apiClient.delete(`/meetings/${id}`)
      meetings.value = meetings.value.filter((m) => m.id !== id)
      if (currentMeeting.value?.id === id) currentMeeting.value = null
    } catch (error) {
      console.error('刪除會議失敗:', error)
      throw error
    }
  }

  /**
   * 從會議批次建立任務（PM/admin）
   * @param {string} meetingId
   * @param {Array} tasks - [{ title, assigneeId, description?, dueDate? }]
   */
  const generateTasks = async (meetingId, tasks) => {
    try {
      const { data } = await apiClient.post(`/meetings/${meetingId}/tasks`, { tasks })
      // 將新建立的任務加入 currentMeeting 的 tasks 陣列
      if (currentMeeting.value?.id === meetingId) {
        currentMeeting.value = {
          ...currentMeeting.value,
          tasks: [...(currentMeeting.value.tasks ?? []), ...data],
        }
      }
      return data
    } catch (error) {
      console.error('從會議建立任務失敗:', error)
      throw error
    }
  }

  return {
    meetings,
    currentMeeting,
    isLoading,
    fetchMeetings,
    fetchMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    generateTasks,
  }
})
