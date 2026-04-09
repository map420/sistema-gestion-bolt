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

const DEFAULT_DATA = { trabajadores: [], registros: [], pagos: [], proyectos: [] }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getAuthUserId(req)
  if (!userId) return res.status(401).json({ error: 'unauthorized' })

  if (req.method === 'GET') {
    const { data } = await supabaseAdmin
      .from('app_data')
      .select('trabajadores, registros, pagos, proyectos')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) return res.json(DEFAULT_DATA)
    res.json({
      trabajadores: data.trabajadores ?? [],
      registros: data.registros ?? [],
      pagos: data.pagos ?? [],
      proyectos: data.proyectos ?? [],
    })
    return
  }

  if (req.method === 'PUT') {
    const body = req.body as typeof DEFAULT_DATA
    const { error } = await supabaseAdmin
      .from('app_data')
      .upsert({
        user_id: userId,
        trabajadores: body.trabajadores ?? [],
        registros: body.registros ?? [],
        pagos: body.pagos ?? [],
        proyectos: body.proyectos ?? [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('user-data PUT error:', error)
      return res.status(500).json({ error: 'db_error' })
    }
    res.json({ ok: true })
    return
  }

  res.status(405).end()
}
