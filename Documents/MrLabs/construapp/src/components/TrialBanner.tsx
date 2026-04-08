import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
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

  if (isUrgent) {
    return (
      <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-semibold text-amber-400">
            {t('trial.warning', { count: daysRemaining })}
          </span>
          <button
            onClick={handleActivate}
            className="text-xs text-amber-300 hover:text-amber-200 hover:underline text-left transition-colors w-fit"
          >
            {t('trial.activate')}
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-400 transition-colors mt-0.5 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="border border-emerald-500/20 bg-emerald-500/10 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-emerald-400">
            {t('trial.active', { count: daysRemaining })}
          </span>
          <button
            onClick={handleActivate}
            className="text-xs text-emerald-300 hover:text-emerald-200 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            {t('trial.buyNow')}
          </button>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-emerald-700 hover:text-emerald-500 transition-colors mt-0.5 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
