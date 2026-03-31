import bcrypt from 'bcrypt'
import prisma from '../lib/prismaClient.js'

const BCRYPT_COST = 10
const VALID_ROLES = ['admin', 'pm', 'rd']

// 排除 passwordHash 的 select 設定
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

// ====== List All Users ======

/**
 * GET /admin/users
 * 回傳所有 User 記錄（排除 passwordHash）
 */
export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'asc' },
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error('listUsers error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Create User Account ======

/**
 * POST /admin/users
 * admin 建立任意角色的使用者帳號，bcrypt hash 密碼（cost 10）
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: '請填寫 name、email、password、role' })
    }

    // 驗證 role enum
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: `role 無效，允許的值為：${VALID_ROLES.join(', ')}`,
      })
    }

    // 檢查 email 是否已存在
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: '此 email 已被使用' })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST)

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: USER_SELECT,
    })

    return res.status(201).json({ user })
  } catch (error) {
    console.error('createUser error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Update User Role ======

/**
 * PATCH /admin/users/:id/role
 * 更新指定使用者的角色；role 須為 Role enum；user 不存在回傳 404
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    // 驗證 role enum
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: `role 無效，允許的值為：${VALID_ROLES.join(', ')}`,
      })
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: '使用者不存在' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SELECT,
    })

    return res.status(200).json({ user })
  } catch (error) {
    console.error('updateUserRole error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
