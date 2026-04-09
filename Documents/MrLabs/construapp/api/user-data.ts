import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabase'
import { getAuthUserId } from './_lib/auth'

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
