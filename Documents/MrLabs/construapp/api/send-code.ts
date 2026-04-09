import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { createHmac } from 'crypto'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function signToken(email: string, code: string, ts: number): string {
  const secret = process.env.OTP_SECRET!
  const payload = `${email}|${code}|${ts}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${ts}.${sig}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body as { email?: string }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email' })
  }

  const code = generateCode()
  const ts = Date.now()
  const token = signToken(email.toLowerCase(), code, ts)

  const resend = new Resend(process.env.RESEND_API_KEY!)
  const appUrl = process.env.APP_URL || 'https://construapp.vercel.app'

  try {
    await resend.emails.send({
      from: 'ConstruApp <onboarding@resend.dev>',
      to: email,
      subject: `${code} — Tu código de verificación`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;background:#07070a;color:#f2f2f7;max-width:480px;margin:0 auto;padding:40px 24px;border-radius:16px">
          <div style="text-align:center;margin-bottom:32px">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#7c5ff033,#a78bfa22);border-radius:14px;margin-bottom:16px">
              <span style="font-size:24px">🏗️</span>
            </div>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#f2f2f7">ConstruApp</h1>
          </div>

          <p style="color:#a0a0b0;font-size:15px;margin-bottom:8px">Tu código de verificación es:</p>

          <div style="background:#0f0f13;border:1px solid rgba(124,95,240,0.25);border-radius:14px;padding:24px;text-align:center;margin:16px 0">
            <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#a78bfa">${code}</span>
          </div>

          <p style="color:#6b6b7a;font-size:13px;text-align:center">
            Válido por 10 minutos. Si no solicitaste esto, ignora este correo.
          </p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0" />
          <p style="color:#38383f;font-size:12px;text-align:center;margin:0">
            <a href="${appUrl}" style="color:#7c5ff0;text-decoration:none">${appUrl}</a>
          </p>
        </div>
      `,
    })
  } catch {
    return res.status(500).json({ error: 'email_failed' })
  }

  // Return signed token (code is NOT included — only ts + HMAC)
  res.json({ token, expiresAt: ts + OTP_TTL_MS })
}
