import bcrypt from 'bcrypt'
import crypto from 'crypto'
import prisma from '../lib/prismaClient.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwtHelper.js'

const BCRYPT_COST = 10

// ====== User Registration ======

/**
 * POST /auth/register
 * 接收 name、email、password，建立新使用者（role 預設 rd）
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: '請填寫 name、email、password' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: '此 email 已被註冊' })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST)

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return res.status(201).json({ user })
  } catch (error) {
    console.error('register error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== User Login ======

/**
 * POST /auth/login
 * 驗證 email/password，成功回傳 accessToken、refreshToken、user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '請填寫 email、password' })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // 使用 generic 訊息避免洩漏使用者是否存在
    if (!user) {
      return res.status(401).json({ message: 'email 或密碼錯誤' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'email 或密碼錯誤' })
    }

    const accessToken = signAccessToken(user.id, user.role)
    const refreshToken = signRefreshToken(user.id)

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('login error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Token Refresh ======

/**
 * POST /auth/refresh
 * 驗證 refresh token 未在黑名單且未過期，發行新 access token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: '未提供 refresh token' })
    }

    // 驗證 token 格式與有效期
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return res.status(401).json({ message: 'refresh token 無效或已過期' })
    }

    // 檢查是否在黑名單
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const blacklisted = await prisma.refreshTokenBlacklist.findUnique({
      where: { tokenHash },
    })

    if (blacklisted) {
      return res.status(401).json({ message: 'refresh token 已被撤銷' })
    }

    // 取得使用者最新 role（以防 role 已更新）
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true },
    })

    if (!user) {
      return res.status(401).json({ message: '使用者不存在' })
    }

    const accessToken = signAccessToken(user.id, user.role)

    return res.status(200).json({ accessToken })
  } catch (error) {
    console.error('refresh error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Logout ======

/**
 * POST /auth/logout
 * 將 refresh token 加入黑名單（儲存 hash 與 invalidatedAt）
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: '未提供 refresh token' })
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    // 冪等處理：若已在黑名單則略過
    await prisma.refreshTokenBlacklist.upsert({
      where: { tokenHash },
      update: {},
      create: {
        tokenHash,
        userId: req.user.id,
      },
    })

    return res.status(204).send()
  } catch (error) {
    console.error('logout error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
