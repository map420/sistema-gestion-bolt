import { useState } from 'react'
import { XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PaymentCancelled() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const goToDashboard = () => {
    window.history.replaceState({}, '', '/')
    window.location.reload()
  }

  const retryPayment = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f8717115] border border-[#f8717130] flex items-center justify-center">
            <XCircle size={28} className="text-[#f87171]" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#f0f0f0]">Pago cancelado</h2>
            <p className="text-sm text-[#666]">
              El pago fue cancelado. Puedes intentarlo cuando quieras.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={retryPayment}
              disabled={loading}
              className="w-full bg-[#9d7ff0] hover:bg-[#8b6fd4] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Reintentar pago
            </button>
            <button
              onClick={goToDashboard}
              className="w-full text-sm text-[#555] hover:text-[#aaa] transition-colors py-2"
            >
              Volver al dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
