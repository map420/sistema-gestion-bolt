import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HardHat, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type Mode = 'login' | 'register'

export default function Login() {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loadingPay, setLoadingPay] = useState(false)

  const validate = (): boolean => {
    if (!email.trim() || !password) { setError(t('auth.errRequired')); return false }
    if (mode === 'register') {
      if (!confirmPassword) { setError(t('auth.errRequired')); return false }
      if (password !== confirmPassword) { setError(t('auth.errPasswordMismatch')); return false }
    }
    return true
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    const result = login(email.trim(), password)
    if (!result.ok && result.error) setError(t(`auth.${result.error}`))
  }

  const handleTrial = () => {
    setError('')
    if (!validate()) return
    const result = register(email.trim(), password)
    if (!result.ok && result.error) setError(t(`auth.${result.error}`))
  }

  const handlePay = async () => {
    setError('')
    if (!validate()) return
    setLoadingPay(true)
    const pendingId = crypto.randomUUID()
    sessionStorage.setItem('construapp_pending_pay', JSON.stringify({ id: pendingId, email: email.trim(), password }))
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingId }),
      })
      if (!res.ok) throw new Error('api error')
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch {
      setError(t('paywall.error'))
      sessionStorage.removeItem('construapp_pending_pay')
      setLoadingPay(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const inputClass = "w-full bg-[#0f0f13] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f2f2f7] placeholder:text-[#38383f] transition-all"

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c5ff0] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#a78bfa] opacity-[0.04] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-2xl accent-gradient opacity-20" />
            <div className="absolute inset-[1px] rounded-[14px] bg-[#0f0f13]" />
            <HardHat size={24} className="text-[#a78bfa] relative z-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#f2f2f7] tracking-tight">ConstruApp</h1>
            <p className="text-sm text-[#6b6b7a] mt-0.5">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f13] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl shadow-black/40">
          <form onSubmit={mode === 'login' ? handleLogin : e => e.preventDefault()} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.email')}</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.emailPh')}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.password')}</label>
              <input
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* Confirm password */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-[#ff453a12] border border-[#ff453a25] rounded-xl px-3 py-2.5">
                <p className="text-xs text-[#ff6b6b] leading-relaxed">{error}</p>
              </div>
            )}

            {/* Login CTA */}
            {mode === 'login' && (
              <button
                type="submit"
                className="w-full accent-gradient text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-1 shadow-lg shadow-[#7c5ff030]"
              >
                {t('auth.loginBtn')}
                <ArrowRight size={15} />
              </button>
            )}
          </form>

          {/* Register dual buttons */}
          {mode === 'register' && (
            <div className="flex flex-col gap-3">
              {/* Trial */}
              <button
                type="button"
                onClick={handleTrial}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-[#7c5ff035] bg-[#7c5ff010] hover:bg-[#7c5ff018] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7c5ff020] flex items-center justify-center">
                    <Sparkles size={14} className="text-[#a78bfa]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#f2f2f7]">{t('auth.trialBtn')}</p>
                    <p className="text-[11px] text-[#6b6b7a]">{t('auth.trialSub')}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#6b6b7a]" />
              </button>

              {/* Pay */}
              <button
                type="button"
                onClick={handlePay}
                disabled={loadingPay}
                className="w-full accent-gradient flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-[#7c5ff030]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {loadingPay
                      ? <Loader2 size={14} className="text-white animate-spin" />
                      : <span className="text-white text-sm font-bold">$</span>
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{t('auth.payBtn')}</p>
                    <p className="text-[11px] text-white/60">{t('auth.paySub')}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/60" />
              </button>
            </div>
          )}

          {/* Switch mode */}
          <button
            type="button"
            onClick={switchMode}
            className="text-xs text-[#6b6b7a] hover:text-[#a0a0b0] transition-colors text-center pt-1"
          >
            {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
          </button>
        </div>

        <p className="text-center text-[11px] text-[#38383f] mt-6">
          Gestión de personal para construcción
        </p>
      </div>
    </div>
  )
}
