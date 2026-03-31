import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/lib/apiClient'

export const useTaskStore = defineStore('task', () => {
  // ====== 狀態 ======
  const tasks = ref([])
  const statusFilter = ref('all')
  const isLoading = ref(false)

  // ====== Computed ======
  /**
   * 依 statusFilter 過濾後的任務列表
   */
  const filteredTasks = computed(() => {
    if (statusFilter.value === 'all') return tasks.value
    return tasks.value.filter((t) => t.status === statusFilter.value)
  })

  // ====== Actions ======

  /**
   * 取得任務列表（PM 取全部，RD 只取自己的，由後端控制）
   */
  const fetchTasks = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/tasks')
      tasks.value = data
    } catch (error) {
      console.error('取得任務失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 建立新任務（PM/admin）
   * @param {Object} payload - { title, assigneeId, description?, dueDate?, meetingId? }
   */
  const createTask = async (payload) => {
    try {
      const { data } = await apiClient.post('/tasks', payload)
      tasks.value.unshift(data)
      return data
    } catch (error) {
      console.error('建立任務失敗:', error)
      throw error
    }
  }

  /**
   * 更新任務（PM 可更新所有欄位，RD 只能更新 status）
   * @param {string} id
   * @param {Object} payload
   */
  const updateTask = async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`/tasks/${id}`, payload)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = data
      }
      return data
    } catch (error) {
      console.error('更新任務失敗:', error)
      throw error
    }
  }

  /**
   * 刪除任務（PM/admin）
   * @param {string} id
   */
  const deleteTask = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (error) {
      console.error('刪除任務失敗:', error)
      throw error
    }
  }

  return {
    tasks,
    statusFilter,
    isLoading,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
})
