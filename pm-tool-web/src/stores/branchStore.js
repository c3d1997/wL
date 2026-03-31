import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/lib/apiClient'

export const useBranchStore = defineStore('branch', () => {
  // ====== 狀態 ======
  const branches = ref([])
  const isLoading = ref(false)

  // ====== Actions ======

  /**
   * 取得分支列表（後端只回傳當前使用者建立的分支）
   */
  const fetchBranches = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/branches')
      branches.value = data
    } catch (error) {
      console.error('取得分支列表失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 建立新分支
   * @param {Object} payload - { name, type, taskId }
   */
  const createBranch = async (payload) => {
    try {
      const { data } = await apiClient.post('/branches', payload)
      branches.value.unshift(data)
      return data
    } catch (error) {
      console.error('建立分支失敗:', error)
      throw error
    }
  }

  /**
   * 更新分支（name, type）
   * @param {string} id
   * @param {Object} payload - { name?, type? }
   */
  const updateBranch = async (id, payload) => {
    try {
      const { data } = await apiClient.patch(`/branches/${id}`, payload)
      const index = branches.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        branches.value[index] = data
      }
      return data
    } catch (error) {
      console.error('更新分支失敗:', error)
      throw error
    }
  }

  /**
   * 刪除分支
   * @param {string} id
   */
  const deleteBranch = async (id) => {
    try {
      await apiClient.delete(`/branches/${id}`)
      branches.value = branches.value.filter((b) => b.id !== id)
    } catch (error) {
      console.error('刪除分支失敗:', error)
      throw error
    }
  }

  return {
    branches,
    isLoading,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  }
})
