import prisma from '../lib/prismaClient.js'
import { createNotificationAndEmail } from '../lib/notificationHelper.js'

// ====== 共用 include 設定 ======
const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true } },
  meeting: { select: { id: true, title: true } },
}

// ====== List Tasks ======

/**
 * GET /tasks
 * PM 回傳全部任務，RD 只回傳指派給自己的任務
 */
export const listTasks = async (req, res) => {
  try {
    const where = req.user.role === 'rd' ? { assigneeId: req.user.id } : {}

    const tasks = await prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ tasks })
  } catch (error) {
    console.error('listTasks error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Create Task ======

/**
 * POST /tasks
 * 建立任務，同步建立通知，非同步寄 Email
 */
export const createTask = async (req, res) => {
  try {
    const { title, assigneeId, description, meetingId, dueDate } = req.body

    if (!title || !assigneeId) {
      return res.status(400).json({ message: '請填寫 title、assigneeId' })
    }

    // 確認 assignee 存在
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!assignee) {
      return res.status(400).json({ message: 'assigneeId 對應的使用者不存在' })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        creatorId: req.user.id,
        meetingId: meetingId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
      },
      include: TASK_INCLUDE,
    })

    // 同步建立通知 + 非同步寄 Email
    await createNotificationAndEmail({
      userId: assigneeId,
      taskId: task.id,
      type: 'task_assigned',
      message: `您有新任務：${title}`,
      email: assignee.email,
      subject: `新任務指派：${title}`,
      html: `<p>您有一個新任務已指派給您：<strong>${title}</strong></p>`,
    })

    return res.status(201).json({ task })
  } catch (error) {
    console.error('createTask error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Update Task ======

/**
 * PATCH /tasks/:id
 * PM 可更新所有欄位；RD 只能更新 status（且只能操作自己的任務）
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { role, id: userId } = req.user

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, email: true, name: true } },
        assignee: { select: { id: true, email: true } },
      },
    })

    if (!task) {
      return res.status(404).json({ message: '任務不存在' })
    }

    // RD 只能操作自己的任務
    if (role === 'rd' && task.assigneeId !== userId) {
      return res.status(403).json({ message: '權限不足，只能更新自己的任務' })
    }

    let updateData = {}

    if (role === 'rd') {
      // RD 只能更新 status
      if (!req.body.status) {
        return res.status(400).json({ message: 'RD 只能更新 status 欄位' })
      }
      updateData = { status: req.body.status }
    } else {
      // PM 可更新所有欄位
      const { title, description, status, assigneeId, dueDate } = req.body
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (status !== undefined) updateData.status = status
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: TASK_INCLUDE,
    })

    // status 變更 → 通知 creator
    if (updateData.status !== undefined && updateData.status !== task.status) {
      await createNotificationAndEmail({
        userId: task.creatorId,
        taskId: task.id,
        type: 'task_updated',
        message: `任務「${task.title}」狀態已更新為 ${updateData.status}`,
        email: task.creator.email,
        subject: `任務狀態更新：${task.title}`,
        html: `<p>任務 <strong>${task.title}</strong> 的狀態已更新為 <strong>${updateData.status}</strong>。</p>`,
      })
    }

    // assigneeId 變更 → 通知新 assignee
    if (updateData.assigneeId !== undefined && updateData.assigneeId !== task.assigneeId) {
      const newAssignee = await prisma.user.findUnique({ where: { id: updateData.assigneeId } })
      if (newAssignee) {
        await createNotificationAndEmail({
          userId: newAssignee.id,
          taskId: task.id,
          type: 'task_assigned',
          message: `您有新任務：${task.title}`,
          email: newAssignee.email,
          subject: `新任務指派：${task.title}`,
          html: `<p>您有一個新任務已指派給您：<strong>${task.title}</strong></p>`,
        })
      }
    }

    return res.status(200).json({ task: updated })
  } catch (error) {
    console.error('updateTask error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Delete Task ======

/**
 * DELETE /tasks/:id
 * PM only（由 roleMiddleware 保護）
 * Branch 與 Notification 由 Prisma cascade 自動刪除
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return res.status(404).json({ message: '任務不存在' })
    }

    await prisma.task.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('deleteTask error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
