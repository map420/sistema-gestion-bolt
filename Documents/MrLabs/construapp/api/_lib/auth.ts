import { createHmac } from 'crypto'
import type { VercelRequest } from '@vercel/node'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function signSessionToken(userId: string): string {
  const secret = process.env.SESSION_SECRET!
  const ts = Date.now()
  const sig = createHmac('sha256', secret).update(`${userId}|${ts}`).digest('hex')
  return `${userId}.${ts}.${sig}`
}

export function verifySessionToken(token: string): string | null {
  if (!token) return null
  const firstDot = token.indexOf('.')
  const lastDot = token.lastIndexOf('.')
  if (firstDot === lastDot) return null // need exactly 2 dots

  const userId = token.slice(0, firstDot)
  const rest = token.slice(firstDot + 1)
  const dotIdx = rest.indexOf('.')
  if (dotIdx === -1) return null

  const tsStr = rest.slice(0, dotIdx)
  const sig = rest.slice(dotIdx + 1)
  const ts = parseInt(tsStr, 10)
  if (isNaN(ts) || Date.now() - ts > SESSION_TTL_MS) return null

  const secret = process.env.SESSION_SECRET!
  const expected = createHmac('sha256', secret).update(`${userId}|${ts}`).digest('hex')
  if (sig !== expected) return null
  return userId
}

export function getAuthUserId(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  return verifySessionToken(auth.slice(7))
}
