import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { supabaseAdmin } from './_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { sessionId, userId } = req.body as { sessionId?: string; userId?: string }
  if (!sessionId) return res.status(400).json({ error: 'missing_sessionId' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return res.json({ paid: false })
  }

  // Mark user as paid in Supabase
  const uid = userId ?? session.metadata?.userId
  if (uid) {
    await supabaseAdmin
      .from('users')
      .update({ paid_at: new Date().toISOString(), stripe_session_id: sessionId })
      .eq('id', uid)
  }

  res.json({ paid: true })
}
