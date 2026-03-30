import 'dotenv/config'
import express from 'express'
import authRoutes from './src/routes/authRoutes.js'

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

// ====== 啟動伺服器 ======
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})

export default app
