import { Resend } from 'resend'
import type { EmailAdapter } from './types'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const resendAdapter: EmailAdapter = {
  async send({ to, subject, html, from }) {
    const { data, error } = await resend.emails.send({
      from: from ?? `Plumbr <noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN}>`,
      to,
      subject,
      html,
    })
    if (error) throw new Error(`[EMAIL] Resend error: ${error.message}`)
    return { id: data!.id }
  },
}
