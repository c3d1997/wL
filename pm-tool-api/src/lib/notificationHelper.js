import prisma from './prismaClient.js'
import { sendEmail } from './resendHelper.js'

/**
 * 同步建立站內通知，非同步寄送 Email（fire-and-forget）
 * @param {{ userId: string, taskId: string, type: string, message: string, email: string, subject: string, html: string }} options
 */
export const createNotificationAndEmail = async ({ userId, taskId, type, message, email, subject, html }) => {
  await prisma.notification.create({
    data: { userId, taskId, type, message },
  })
  // fire-and-forget：不 await，不阻塞主流程
  sendEmail({ to: email, subject, html })
}
