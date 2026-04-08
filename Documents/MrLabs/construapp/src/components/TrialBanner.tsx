import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface Props {
  daysRemaining: number
}

export default function TrialBanner({ daysRemaining }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const isUrgent = daysRemaining <= 3
  const progress = Math.round((daysRemaining / 15) * 100)

  const handleActivate = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) return
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch { /* ignore */ }
  }

  return (
    <div className={`rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 ${
      isUrgent
        ? 'bg-[#ffa80012] border border-[#ffa80025]'
        : 'bg-[#7c5ff010] border border-[#7c5ff025]'
    }`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isUrgent ? 'bg-[#ffa80020]' : 'bg-[#7c5ff020]'
      }`}>
        <Zap size={14} className={isUrgent ? 'text-[#ffa800]' : 'text-[#a78bfa]'} />
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <p className={`text-xs font-semibold ${isUrgent ? 'text-[#ffa800]' : 'text-[#a78bfa]'}`}>
          {isUrgent ? t('trial.warning', { count: daysRemaining }) : t('trial.active', { count: daysRemaining })}
        </p>
        {!isUrgent && (
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full accent-gradient rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleActivate}
        className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all ${
          isUrgent
            ? 'bg-[#ffa800] text-black hover:bg-[#ffb733]'
            : 'accent-gradient text-white hover:opacity-90'
        }`}
      >
        {isUrgent ? t('trial.activate').replace(' →', '') : t('trial.buyNow').replace(' →', '')}
      </button>

      <button
        onClick={() => setDismissed(true)}
        className="text-[#38383f] hover:text-[#6b6b7a] transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}
