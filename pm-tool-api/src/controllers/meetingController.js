import prisma from '../lib/prismaClient.js'
import { createNotificationAndEmail } from '../lib/notificationHelper.js'

// ====== List Meetings ======

/**
 * GET /meetings
 * 所有認證使用者可存取，include createdBy（id, name）
 */
export const listMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { meetingDate: 'desc' },
    })

    return res.status(200).json({ meetings })
  } catch (error) {
    console.error('listMeetings error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Create Meeting ======

/**
 * POST /meetings
 * 驗證必填欄位，設定 createdById = req.user.id
 */
export const createMeeting = async (req, res) => {
  try {
    const { title, meetingDate, content } = req.body

    if (!title || !meetingDate || !content) {
      return res.status(400).json({ message: '請填寫 title、meetingDate、content' })
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        meetingDate: new Date(meetingDate),
        content,
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    })

    return res.status(201).json({ meeting })
  } catch (error) {
    console.error('createMeeting error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Get Single Meeting ======

/**
 * GET /meetings/:id
 * 回傳完整 meeting + tasks 陣列（id, title, status, assignee id/name）
 */
export const getMeeting = async (req, res) => {
  try {
    const { id } = req.params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!meeting) {
      return res.status(404).json({ message: '會議不存在' })
    }

    return res.status(200).json({ meeting })
  } catch (error) {
    console.error('getMeeting error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Update Meeting ======

/**
 * PATCH /meetings/:id
 * 可更新 title、meetingDate、content
 */
export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params
    const { title, meetingDate, content } = req.body

    const existing = await prisma.meeting.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: '會議不存在' })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (meetingDate !== undefined) updateData.meetingDate = new Date(meetingDate)

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    })

    return res.status(200).json({ meeting })
  } catch (error) {
    console.error('updateMeeting error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Delete Meeting ======

/**
 * DELETE /meetings/:id
 * 刪除 Meeting，關聯 Task 的 meetingId 設為 null（Prisma schema onDelete: SetNull）
 */
export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.meeting.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: '會議不存在' })
    }

    await prisma.meeting.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('deleteMeeting error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Generate Tasks from Meeting ======

/**
 * POST /meetings/:id/tasks
 * 批次建立任務，每筆同步建通知、非同步寄 Email
 */
export const generateTasksFromMeeting = async (req, res) => {
  try {
    const { id } = req.params
    const { tasks } = req.body

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'tasks 陣列至少需包含一筆資料' })
    }

    const meeting = await prisma.meeting.findUnique({ where: { id } })
    if (!meeting) {
      return res.status(404).json({ message: '會議不存在' })
    }

    // 批次建立任務（逐一建立以取得 id 供通知使用）
    const createdTasks = []
    for (const taskData of tasks) {
      const { title, assigneeId, description, dueDate } = taskData

      if (!title || !assigneeId) continue

      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
      if (!assignee) continue

      const task = await prisma.task.create({
        data: {
          title,
          description,
          assigneeId,
          creatorId: req.user.id,
          meetingId: id,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'pending',
        },
      })

      await createNotificationAndEmail({
        userId: assigneeId,
        taskId: task.id,
        type: 'task_assigned',
        message: `您有新任務：${title}`,
        email: assignee.email,
        subject: `新任務指派：${title}`,
        html: `<p>您有一個新任務已指派給您：<strong>${title}</strong></p>`,
      })

      createdTasks.push(task)
    }

    return res.status(201).json({ tasks: createdTasks })
  } catch (error) {
    console.error('generateTasksFromMeeting error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
