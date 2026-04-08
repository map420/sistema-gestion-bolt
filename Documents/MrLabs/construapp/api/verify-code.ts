import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'crypto'

const OTP_TTL_MS = 10 * 60 * 1000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, code, token } = req.body as { email?: string; code?: string; token?: string }
  if (!email || !code || !token) return res.status(400).json({ ok: false, error: 'missing_fields' })

  const secret = process.env.OTP_SECRET
  if (!secret) return res.status(500).json({ ok: false, error: 'server_config' })

  // Parse token: "timestamp.signature"
  const dotIdx = token.indexOf('.')
  if (dotIdx === -1) return res.status(400).json({ ok: false, error: 'invalid_token' })

  const ts = parseInt(token.slice(0, dotIdx), 10)
  const sig = token.slice(dotIdx + 1)

  // Check expiry
  if (isNaN(ts) || Date.now() - ts > OTP_TTL_MS) {
    return res.json({ ok: false, error: 'expired' })
  }

  // Recompute HMAC
  const payload = `${email.toLowerCase()}|${code}|${ts}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')

  if (sig !== expected) {
    return res.json({ ok: false, error: 'invalid_code' })
  }

  res.json({ ok: true })
}
