import { verifyAccessToken } from '../lib/jwtHelper.js'

/**
 * Auth Middleware：驗證 Authorization: Bearer <token> header
 * 成功時將 { id, role } 掛到 req.user，失敗時回傳 HTTP 401
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供認證 token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: 'token 無效或已過期' })
  }
}

export default authMiddleware
