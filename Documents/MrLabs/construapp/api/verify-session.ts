import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const sessionId = req.query.sessionId as string

  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' })

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  res.json({
    paid: session.payment_status === 'paid',
    userId: session.metadata?.userId,
  })
}
