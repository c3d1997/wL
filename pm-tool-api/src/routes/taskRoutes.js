import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js'

const router = Router()

// ====== 所有 task 路由均需認證 ======
router.use(authMiddleware)

// GET /tasks — 所有認證使用者可存取（controller 內依 role 過濾）
router.get('/', listTasks)

// POST /tasks — 僅 pm / admin
router.post('/', requireRole('pm', 'admin'), createTask)

// PATCH /tasks/:id — 所有認證使用者（controller 內依 role 判斷可更新欄位）
router.patch('/:id', updateTask)

// DELETE /tasks/:id — 僅 pm / admin
router.delete('/:id', requireRole('pm', 'admin'), deleteTask)

export default router
