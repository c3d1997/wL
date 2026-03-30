import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  listMeetings,
  createMeeting,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  generateTasksFromMeeting,
} from '../controllers/meetingController.js'

const router = Router()

// ====== 所有 meeting 路由均需認證 ======
router.use(authMiddleware)

// GET /meetings — 所有認證使用者可存取
router.get('/', listMeetings)

// POST /meetings — 僅 pm / admin
router.post('/', requireRole('pm', 'admin'), createMeeting)

// GET /meetings/:id — 所有認證使用者可存取
router.get('/:id', getMeeting)

// PATCH /meetings/:id — 僅 pm / admin
router.patch('/:id', requireRole('pm', 'admin'), updateMeeting)

// DELETE /meetings/:id — 僅 pm / admin
router.delete('/:id', requireRole('pm', 'admin'), deleteMeeting)

// POST /meetings/:id/tasks — 僅 pm / admin
router.post('/:id/tasks', requireRole('pm', 'admin'), generateTasksFromMeeting)

export default router
