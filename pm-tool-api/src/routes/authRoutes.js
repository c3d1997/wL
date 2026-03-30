import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

// ====== Public Routes（不需認證）======
router.post('/register', register)
router.post('/login', login)

// ====== Refresh Token（以 refresh token 驗證，不需 access token）======
router.post('/refresh', refresh)

// ====== Protected Routes（需 access token 認證）======
router.post('/logout', authMiddleware, logout)

export default router
