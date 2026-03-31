import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 非同步寄送 Email（fire-and-forget）
 * 失敗時記錄 console.error，不拋出錯誤，不阻塞主流程
 * @param {{ to: string, subject: string, html: string }} options
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'PM Tool <noreply@resend.dev>',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('sendEmail error:', error)
  }
}
