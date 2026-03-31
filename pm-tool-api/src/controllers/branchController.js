import prisma from '../lib/prismaClient.js'

// BranchType enum 值（與 prisma/schema.prisma 保持一致）
const VALID_BRANCH_TYPES = ['feat', 'fix', 'hotfix', 'update', 'chore']

// ====== List Branches ======

/**
 * GET /branches
 * 只回傳 createdById === req.user.id 的分支，include task（id, title, status）
 */
export const listBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { createdById: req.user.id },
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ branches })
  } catch (error) {
    console.error('listBranches error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Create Branch ======

/**
 * POST /branches
 * 驗證 name、type、taskId；確認 taskId 存在；設定 createdById = req.user.id
 */
export const createBranch = async (req, res) => {
  try {
    const { name, type, taskId } = req.body

    if (!name || !type || !taskId) {
      return res.status(400).json({ message: '請填寫 name、type、taskId' })
    }

    // 驗證 BranchType enum
    if (!VALID_BRANCH_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type 無效，允許的值為：${VALID_BRANCH_TYPES.join(', ')}`,
      })
    }

    // 確認 taskId 存在
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return res.status(400).json({ message: '指定的 taskId 不存在' })
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        type,
        taskId,
        createdById: req.user.id,
      },
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
    })

    return res.status(201).json({ branch })
  } catch (error) {
    console.error('createBranch error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Update Branch ======

/**
 * PATCH /branches/:id
 * 可更新 name、type；確認 createdById === req.user.id（否則 403）
 */
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params
    const { name, type } = req.body

    const branch = await prisma.branch.findUnique({ where: { id } })

    if (!branch) {
      return res.status(404).json({ message: '分支不存在' })
    }

    // 只有建立者可以修改
    if (branch.createdById !== req.user.id) {
      return res.status(403).json({ message: '權限不足，只能更新自己建立的分支' })
    }

    // 驗證 type（若有傳入）
    if (type !== undefined && !VALID_BRANCH_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type 無效，允許的值為：${VALID_BRANCH_TYPES.join(', ')}`,
      })
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type

    const updated = await prisma.branch.update({
      where: { id },
      data: updateData,
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
    })

    return res.status(200).json({ branch: updated })
  } catch (error) {
    console.error('updateBranch error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Delete Branch ======

/**
 * DELETE /branches/:id
 * 確認 createdById === req.user.id（否則 403）；成功回傳 204
 */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params

    const branch = await prisma.branch.findUnique({ where: { id } })

    if (!branch) {
      return res.status(404).json({ message: '分支不存在' })
    }

    // 只有建立者可以刪除
    if (branch.createdById !== req.user.id) {
      return res.status(403).json({ message: '權限不足，只能刪除自己建立的分支' })
    }

    await prisma.branch.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('deleteBranch error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
