import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ====== 路由定義（Lazy-load 各頁面） ======
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ---- 公開路由 ----
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false },
    },

    // ---- 錯誤頁面 ----
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/views/ErrorView.vue'),
      props: { code: 403 },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/ErrorView.vue'),
      props: { code: 404 },
    },

    // ---- 受保護路由（需登入） ----
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // 根路徑重導至 /tasks
        {
          path: '',
          redirect: '/tasks',
        },

        // 任務：admin, pm, rd 均可存取
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/views/tasks/TaskListView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'pm', 'rd'] },
        },

        // 會議：admin, pm, rd 均可存取
        {
          path: 'meetings',
          name: 'meetings',
          component: () => import('@/views/meetings/MeetingListView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'pm', 'rd'] },
        },
        {
          path: 'meetings/:id',
          name: 'meeting-detail',
          component: () => import('@/views/meetings/MeetingDetailView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'pm', 'rd'] },
        },

        // 分支：僅 rd 可存取
        {
          path: 'branches',
          name: 'branches',
          component: () => import('@/views/branches/BranchListView.vue'),
          meta: { requiresAuth: true, roles: ['rd'] },
        },

        // 通知：所有已登入使用者
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/notifications/NotificationListView.vue'),
          meta: { requiresAuth: true, roles: ['admin', 'pm', 'rd'] },
        },

        // Admin 後台：僅 admin
        {
          path: 'admin',
          redirect: '/admin/users',
        },
        {
          path: 'admin/users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUserListView.vue'),
          meta: { requiresAuth: true, roles: ['admin'] },
        },
      ],
    },
  ],
})

// ====== 全域路由守衛 ======
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 不需要認證的路由（如 /login）直接放行
  if (to.meta.requiresAuth === false) {
    // 已登入則不允許進入 /login，重導至 /tasks
    if (authStore.isAuthenticated && to.name === 'login') {
      return { name: 'tasks' }
    }
    return true
  }

  // 需要認證：未登入則重導 /login
  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }

  // 角色控制：路由有 roles 限制時，檢查當前使用者角色
  const allowedRoles = to.meta.roles
  if (allowedRoles && !allowedRoles.includes(authStore.userRole)) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
