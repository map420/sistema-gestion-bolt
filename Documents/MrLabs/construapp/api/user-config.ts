import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabase'
import { getAuthUserId } from './_lib/auth'

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
