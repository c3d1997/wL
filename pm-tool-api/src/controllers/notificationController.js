import prisma from '../lib/prismaClient.js'

// ====== List Notifications ======

/**
 * GET /notifications
 * 只回傳 userId === req.user.id 的通知，按 createdAt 降序
 */
export const listNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ notifications })
  } catch (error) {
    console.error('listNotifications error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Mark Single Notification as Read ======

/**
 * PATCH /notifications/:id/read
 * 確認通知屬於 req.user（否則 403）；不存在回傳 404；更新 isRead = true
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const notification = await prisma.notification.findUnique({ where: { id } })

    if (!notification) {
      return res.status(404).json({ message: '通知不存在' })
    }

    // 確認通知屬於自己（先 404 再 403，避免洩漏資料是否存在）
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: '權限不足，只能標記自己的通知' })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return res.status(200).json({ notification: updated })
  } catch (error) {
    console.error('markAsRead error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}

// ====== Mark All Notifications as Read ======

/**
 * PATCH /notifications/read-all
 * 批次更新 userId === req.user.id 的所有通知 isRead = true
 * 回傳 { count: N } 表示更新筆數
 */
export const markAllAsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    })

    return res.status(200).json({ count: result.count })
  } catch (error) {
    console.error('markAllAsRead error:', error)
    return res.status(500).json({ message: '伺服器錯誤，請稍後再試' })
  }
}
