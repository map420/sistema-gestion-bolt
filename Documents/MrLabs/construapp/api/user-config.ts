import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } })

function getAuthUserId(req: VercelRequest): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const firstDot = token.indexOf('.')
  const lastDot = token.lastIndexOf('.')
  if (firstDot === lastDot) return null
  const userId = token.slice(0, firstDot)
  const rest = token.slice(firstDot + 1)
  const dotIdx = rest.indexOf('.')
  if (dotIdx === -1) return null
  const tsStr = rest.slice(0, dotIdx)
  const sig = rest.slice(dotIdx + 1)
  const ts = parseInt(tsStr, 10)
  if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null
  const expected = createHmac('sha256', process.env.SESSION_SECRET!).update(`${userId}|${ts}`).digest('hex')
  return sig === expected ? userId : null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getAuthUserId(req)
  if (!userId) return res.status(401).json({ error: 'unauthorized' })

  if (req.method === 'GET') {
    const { data } = await supabaseAdmin
      .from('configs')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle()

    res.json(data?.data ?? {})
    return
  }

  if (req.method === 'PUT') {
    const { error } = await supabaseAdmin
      .from('configs')
      .upsert({ user_id: userId, data: req.body, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

    if (error) {
      console.error('user-config PUT error:', error)
      return res.status(500).json({ error: 'db_error' })
    }
    res.json({ ok: true })
    return
  }

  res.status(405).end()
}
