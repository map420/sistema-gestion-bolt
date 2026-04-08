import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HardHat, Loader2 } from 'lucide-react'
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

    // Store credentials temporarily — account is created ONLY after payment succeeds
    const pendingId = crypto.randomUUID()
    sessionStorage.setItem('construapp_pending_pay', JSON.stringify({
      id: pendingId,
      email: email.trim(),
      password,
    }))

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

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#9d7ff020] border border-[#9d7ff030] flex items-center justify-center">
            <HardHat size={28} className="text-[#9d7ff0]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">ConstruApp</h1>
          <p className="text-sm text-[#555]">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={mode === 'login' ? handleLogin : e => e.preventDefault()}
          className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('auth.email')}</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.emailPh')}
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('auth.password')}</label>
            <input
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
            />
          </div>

          {/* Confirm password (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#555] uppercase tracking-wide">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-[#f87171] bg-[#f8717110] border border-[#f8717130] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Login button */}
          {mode === 'login' && (
            <button
              type="submit"
              className="bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
            >
              {t('auth.loginBtn')}
            </button>
          )}

          {/* Register — two buttons */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* Trial button */}
              <button
                type="button"
                onClick={handleTrial}
                className="flex flex-col items-center gap-0.5 px-3 py-3 rounded-xl border border-[#3C3489]/40 bg-[#EEEDFE] hover:bg-[#E0DEFF] transition-colors"
              >
                <span className="text-sm font-semibold text-[#3C3489]">{t('auth.trialBtn')}</span>
                <span className="text-[11px] text-[#6B63B5]">{t('auth.trialSub')}</span>
              </button>

              {/* Pay button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={loadingPay}
                className="flex flex-col items-center gap-0.5 px-3 py-3 rounded-xl bg-[#9d7ff0] hover:bg-[#8b6fd4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingPay
                  ? <Loader2 size={16} className="text-white animate-spin" />
                  : <>
                      <span className="text-sm font-semibold text-white">{t('auth.payBtn')}</span>
                      <span className="text-[11px] text-white/70">{t('auth.paySub')}</span>
                    </>
                }
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={switchMode}
            className="text-xs text-[#555] hover:text-[#aaa] transition-colors text-center"
          >
            {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
          </button>
        </form>
      </div>
    </div>
  )
}
