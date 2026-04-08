import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  sessionId: string
  onConfirm: (sessionId: string) => Promise<void>
}

export default function PaymentSuccess({ sessionId, onConfirm }: Props) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    onConfirm(sessionId)
      .then(() => {
        setStatus('success')
        // Clear URL params after short delay so user can see the success state
        setTimeout(() => {
          window.history.replaceState({}, '', '/')
        }, 1500)
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
        setStatus('error')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-5 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 size={48} className="text-[#9d7ff0] animate-spin" />
              <p className="text-[#aaa] text-sm">{t('paywall.verifying')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={48} className="text-[#4ade80]" />
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-[#f0f0f0]">{t('paywall.success')}</h2>
                <p className="text-sm text-[#666]">{t('paywall.successSub')}</p>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-sm text-[#f87171] bg-[#f8717110] border border-[#f8717130] rounded-lg px-4 py-3 w-full">
                {t('paywall.error')} {errorMsg && `(${errorMsg})`}
              </p>
              <button
                onClick={() => window.history.replaceState({}, '', '/')}
                className="text-xs text-[#555] hover:text-[#aaa] transition-colors"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
