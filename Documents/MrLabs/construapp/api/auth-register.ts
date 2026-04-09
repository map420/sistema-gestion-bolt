import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './_lib/supabase'
import { signSessionToken } from './_lib/auth'

function hashPassword(password: string): string {
  return Buffer.from('construapp:' + password).toString('base64')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })

  const email_norm = email.trim().toLowerCase()

  // Check for existing user
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email_norm)
    .maybeSingle()

  if (existing) return res.status(409).json({ ok: false, error: 'errUserExists' })

  const nombre = email_norm.split('@')[0]

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert({ nombre, email: email_norm, password_hash: hashPassword(password) })
    .select('id, nombre, email, creado_en')
    .single()

  if (error || !user) {
    console.error('register error:', error)
    return res.status(500).json({ ok: false, error: 'db_error' })
  }

  // Create empty app_data row
  await supabaseAdmin.from('app_data').insert({
    user_id: user.id,
    trabajadores: [],
    registros: [],
    pagos: [],
    proyectos: [],
  })

  const token = signSessionToken(user.id)

  res.json({
    ok: true,
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email, creadoEn: user.creado_en },
  })
}
