import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  listUsers,
  createUser,
  updateUserRole,
} from '../controllers/adminController.js'

const router = Router()

// ====== 所有 admin 路由均需認證，且限 admin 角色 ======
router.use(authMiddleware)
router.use(requireRole('admin'))

router.get('/users', listUsers)
router.post('/users', createUser)
router.patch('/users/:id/role', updateUserRole)

export default router
