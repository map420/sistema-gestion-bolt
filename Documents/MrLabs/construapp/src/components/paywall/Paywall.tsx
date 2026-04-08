import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface Props {
  userId: string
}

export default function Paywall({ userId }: Props) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error('api error')
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch {
      setError(t('paywall.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#9d7ff020] border border-[#9d7ff030] flex items-center justify-center">
            <Lock size={32} className="text-[#9d7ff0]" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#f0f0f0] leading-tight">
              {t('paywall.title')}
            </h1>
            <p className="text-sm text-[#666]">
              {t('paywall.subtitle')}
            </p>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#9d7ff0]">
              {t('paywall.price')}
            </span>
            <span className="text-xs text-[#555]">
              {t('paywall.priceNote')}
            </span>
          </div>

          {/* Features */}
          <div className="w-full flex flex-col gap-3 text-left">
            {(['feature1', 'feature2', 'feature3'] as const).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[#9d7ff0] shrink-0" />
                <span className="text-sm text-[#aaa]">{t(`paywall.${key}`)}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="w-full text-xs text-[#f87171] bg-[#f8717110] border border-[#f8717130] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-[#9d7ff0] hover:bg-[#8b6fd4] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl text-lg font-bold transition-colors"
          >
            {loading ? t('paywall.loading') : t('paywall.cta')}
          </button>

          {/* Logout link */}
          <button
            onClick={logout}
            className="text-xs text-[#444] hover:text-[#888] transition-colors"
          >
            {t('paywall.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
