import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/lib/apiClient'

export const useAdminStore = defineStore('admin', () => {
  // ====== 狀態 ======
  const users = ref([])
  const isLoading = ref(false)

  // ====== Actions ======

  /**
   * 取得所有使用者列表（不含 passwordHash）
   */
  const fetchUsers = async () => {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/admin/users')
      users.value = data
    } catch (error) {
      console.error('取得使用者列表失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 建立新使用者
   * @param {Object} payload - { name, email, password, role }
   */
  const createUser = async (payload) => {
    try {
      const { data } = await apiClient.post('/admin/users', payload)
      users.value.push(data)
      return data
    } catch (error) {
      console.error('建立使用者失敗:', error)
      throw error
    }
  }

  /**
   * 更新使用者角色
   * @param {string} id
   * @param {string} role - 'admin' | 'pm' | 'rd'
   */
  const updateUserRole = async (id, role) => {
    try {
      const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role })
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = data
      }
      return data
    } catch (error) {
      console.error('更新角色失敗:', error)
      throw error
    }
  }

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUserRole,
  }
})
