import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  listBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js'

const router = Router()

// ====== 所有 branch 路由均需認證 ======
router.use(authMiddleware)

// GET — 所有認證使用者可存取（controller 內只回傳自己建立的）
router.get('/', listBranches)

// POST / PATCH / DELETE — 僅 rd（分支操作為 RD 專屬）
router.post('/', requireRole('rd'), createBranch)
router.patch('/:id', requireRole('rd'), updateBranch)
router.delete('/:id', requireRole('rd'), deleteBranch)

export default router
