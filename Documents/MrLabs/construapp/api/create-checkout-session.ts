import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { userId } = req.body as { userId: string }
  const appUrl = process.env.APP_URL || `https://${req.headers.host}`

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'ConstruApp — Acceso vitalicio',
          description: 'Pago único. Sin suscripciones. Acceso para siempre.',
        },
        unit_amount: 9900, // $99.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${appUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}&uid=${userId}`,
    cancel_url: `${appUrl}?payment=cancelled`,
    metadata: { userId },
  })

  res.json({ url: session.url })
}
