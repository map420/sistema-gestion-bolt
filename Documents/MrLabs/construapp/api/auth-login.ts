import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } })

function signSessionToken(userId: string): string {
  const ts = Date.now()
  const sig = createHmac('sha256', process.env.SESSION_SECRET!).update(`${userId}|${ts}`).digest('hex')
  return `${userId}.${ts}.${sig}`
}

function hashPassword(password: string): string {
  return Buffer.from('construapp:' + password).toString('base64')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })

  const email_norm = email.trim().toLowerCase()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, nombre, email, password_hash, creado_en, paid_at, stripe_session_id')
    .eq('email', email_norm)
    .maybeSingle()

  if (!user) return res.status(401).json({ ok: false, error: 'errUserNotFound' })
  if (user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ ok: false, error: 'errWrongPassword' })
  }

  // Ensure app_data row exists (for users migrated without it)
  await supabaseAdmin
    .from('app_data')
    .upsert({ user_id: user.id, trabajadores: [], registros: [], pagos: [], proyectos: [] }, { onConflict: 'user_id', ignoreDuplicates: true })

  const token = signSessionToken(user.id)

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      creadoEn: user.creado_en,
      paidAt: user.paid_at,
    },
  })
}
