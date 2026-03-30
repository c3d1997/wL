import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET

/**
 * 產生 Access Token（有效期 15 分鐘）
 * @param {string} userId - 使用者 ID
 * @param {string} role - 使用者角色（admin / pm / rd）
 * @returns {string} JWT access token
 */
export const signAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

/**
 * 產生 Refresh Token（有效期 7 天）
 * @param {string} userId - 使用者 ID
 * @returns {string} JWT refresh token
 */
export const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

/**
 * 驗證 Access Token
 * @param {string} token - JWT access token
 * @returns {{ id: string, role: string }} 解碼後的 payload
 * @throws {Error} token 無效或過期時拋出
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET)
}

/**
 * 驗證 Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {{ id: string }} 解碼後的 payload
 * @throws {Error} token 無效或過期時拋出
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET)
}
