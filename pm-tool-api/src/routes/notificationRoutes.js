import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js'

const router = Router()

// ====== 所有 notification 路由均需認證 ======
router.use(authMiddleware)

router.get('/', listNotifications)
router.patch('/read-all', markAllAsRead)
router.patch('/:id/read', markAsRead)

export default router
