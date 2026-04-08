import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, Check, Loader2, LogOut } from 'lucide-react'
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
      if (!res.ok) throw new Error()
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch {
      setError(t('paywall.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#7c5ff0] opacity-[0.05] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#0f0f13] border border-white/[0.07] rounded-3xl p-8 flex flex-col items-center gap-6 text-center shadow-2xl shadow-black/50">

          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#ff453a] opacity-10 rounded-2xl" />
            <div className="absolute inset-[1px] bg-[#0f0f13] rounded-[14px]" />
            <Lock size={24} className="text-[#ff453a] relative z-10" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold text-[#f2f2f7] leading-tight">{t('paywall.title')}</h1>
            <p className="text-sm text-[#6b6b7a] leading-relaxed">{t('paywall.subtitle')}</p>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1">
            <p className="text-4xl font-black text-[#f2f2f7]">{t('paywall.price')}</p>
            <p className="text-xs text-[#6b6b7a]">{t('paywall.priceNote')}</p>
          </div>

          {/* Features */}
          <div className="w-full flex flex-col gap-2.5 text-left">
            {(['feature1', 'feature2', 'feature3'] as const).map(key => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#7c5ff020] flex items-center justify-center shrink-0">
                  <Check size={11} className="text-[#a78bfa]" />
                </div>
                <span className="text-sm text-[#a0a0b0]">{t(`paywall.${key}`)}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="w-full text-xs text-[#ff6b6b] bg-[#ff453a12] border border-[#ff453a25] rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full accent-gradient text-white py-4 rounded-2xl text-base font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xl shadow-[#7c5ff040] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? t('paywall.loading') : t('paywall.cta')}
          </button>

          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#38383f] hover:text-[#6b6b7a] transition-colors">
            <LogOut size={12} />
            {t('paywall.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
