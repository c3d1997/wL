import 'dotenv/config'
import express from 'express'
import authRoutes from './src/routes/authRoutes.js'
import taskRoutes from './src/routes/taskRoutes.js'
import meetingRoutes from './src/routes/meetingRoutes.js'
import branchRoutes from './src/routes/branchRoutes.js'
import notificationRoutes from './src/routes/notificationRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'

const app = express()
const PORT = process.env.PORT ?? 3000

// ====== Middleware ======
app.use(express.json())

// ====== Health Check ======
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ====== Routes ======
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/meetings', meetingRoutes)
app.use('/branches', branchRoutes)
app.use('/notifications', notificationRoutes)
app.use('/admin', adminRoutes)

// ====== 全域錯誤處理 Middleware ======
// 必須放在所有路由之後，Express 以 4 個參數識別為錯誤處理 middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('未處理的錯誤:', err)
  return res.status(500).json({ message: '伺服器發生未預期的錯誤，請稍後再試' })
})

// ====== 啟動伺服器 ======
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})

export default app
