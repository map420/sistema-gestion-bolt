import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HardHat, Loader2, ArrowRight, Sparkles, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type Mode = 'login' | 'register'
type Step = 'form' | 'verify'
type Intent = 'trial' | 'pay'

export default function Login() {
  const { t } = useTranslation()
  const { login, register } = useAuth()

  // Form state
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  // OTP verification state
  const [step, setStep] = useState<Step>('form')
  const [intent, setIntent] = useState<Intent>('trial')
  const [otpToken, setOtpToken] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loadingPay, setLoadingPay] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const validate = (): boolean => {
    if (!email.trim() || !password) { setError(t('auth.errRequired')); return false }
    if (mode === 'register') {
      if (!confirmPassword) { setError(t('auth.errRequired')); return false }
      if (password !== confirmPassword) { setError(t('auth.errPasswordMismatch')); return false }
    }
    return true
  }

  // ── Login (no OTP needed) ─────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setSending(true)
    try {
      const result = await login(email.trim(), password)
      if (!result.ok && result.error) setError(t(`auth.${result.error}`))
    } finally {
      setSending(false)
    }
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = async (intentType: Intent) => {
    setError('')
    if (!validate()) return
    setSending(true)
    setIntent(intentType)
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json() as { token?: string; error?: string }
      if (!res.ok || !data.token) throw new Error(data.error ?? 'send_failed')
      setOtpToken(data.token)
      setCode(['', '', '', '', '', ''])
      setStep('verify')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch {
      setError('No se pudo enviar el código. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  // ── OTP input handling ────────────────────────────────────────────────────
  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) {
      setCode(digits.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  // ── Verify OTP then continue ──────────────────────────────────────────────
  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Ingresa el código completo.'); return }
    setError('')
    setVerifying(true)

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: fullCode, token: otpToken }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (!data.ok) {
        if (data.error === 'expired') setError('El código expiró. Solicita uno nuevo.')
        else setError('Código incorrecto. Intenta de nuevo.')
        setVerifying(false)
        return
      }

      // OTP verified — proceed with intent
      if (intent === 'trial') {
        const result = await register(email.trim(), password)
        if (!result.ok && result.error) { setError(t(`auth.${result.error}`)); setVerifying(false); return }
      } else {
        // Pay intent: save pending registration, redirect to Stripe
        const pendingId = crypto.randomUUID()
        sessionStorage.setItem('construapp_pending_pay', JSON.stringify({ id: pendingId, email: email.trim(), password }))
        setLoadingPay(true)
        const res2 = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: pendingId }),
        })
        if (!res2.ok) throw new Error('checkout_failed')
        const d = await res2.json() as { url: string }
        window.location.href = d.url
      }
    } catch {
      setError('Error al procesar. Intenta de nuevo.')
      setVerifying(false)
      setLoadingPay(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setStep('form')
    setError('')
    setPassword('')
    setConfirmPassword('')
    setCode(['', '', '', '', '', ''])
  }

  const inputClass = "w-full bg-[#0f0f13] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f2f2f7] placeholder:text-[#38383f] transition-all"

  // ── OTP Screen ────────────────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c5ff0] opacity-[0.04] blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          <div className="bg-[#0f0f13] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setStep('form'); setError('') }}
                className="p-2 text-[#6b6b7a] hover:text-[#f2f2f7] rounded-xl hover:bg-white/5 transition-all"
              >
                <ArrowLeft size={15} />
              </button>
              <div>
                <h2 className="text-base font-semibold text-[#f2f2f7]">Verifica tu correo</h2>
                <p className="text-xs text-[#6b6b7a] mt-0.5">Código enviado a <span className="text-[#a78bfa]">{email}</span></p>
              </div>
            </div>

            {/* Mail icon */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-14 h-14 rounded-2xl relative flex items-center justify-center">
                <div className="absolute inset-0 accent-gradient opacity-15 rounded-2xl" />
                <Mail size={24} className="text-[#a78bfa] relative z-10" />
              </div>
              <p className="text-xs text-[#6b6b7a] text-center">Ingresa el código de 6 dígitos</p>
            </div>

            {/* OTP inputs */}
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-13 text-center text-lg font-bold bg-[#07070a] border rounded-xl text-[#f2f2f7] transition-all ${
                    digit ? 'border-[#7c5ff0] bg-[#7c5ff010]' : 'border-white/[0.07]'
                  }`}
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#ff453a12] border border-[#ff453a25] rounded-xl px-4 py-3">
                <p className="text-xs text-[#ff6b6b]">{error}</p>
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={verifying || loadingPay || code.join('').length < 6}
              className="w-full accent-gradient text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-[#7c5ff030]"
            >
              {(verifying || loadingPay) && <Loader2 size={15} className="animate-spin" />}
              {intent === 'pay' && loadingPay ? 'Redirigiendo a pago...' : verifying ? 'Verificando...' : 'Confirmar'}
            </button>

            {/* Resend */}
            <button
              onClick={() => sendOtp(intent)}
              disabled={sending}
              className="text-xs text-[#6b6b7a] hover:text-[#a78bfa] transition-colors text-center"
            >
              {sending ? 'Enviando...' : '¿No llegó? Reenviar código'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form Screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 relative overflow-hidden">
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
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.email')}</label>
              <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.emailPh')} className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.password')}</label>
              <input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider">{t('auth.confirmPassword')}</label>
                <input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
              </div>
            )}

            {error && (
              <div className="bg-[#ff453a12] border border-[#ff453a25] rounded-xl px-3 py-2.5">
                <p className="text-xs text-[#ff6b6b]">{error}</p>
              </div>
            )}

            {mode === 'login' && (
              <button type="submit" disabled={sending} className="w-full accent-gradient text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity mt-1 shadow-lg shadow-[#7c5ff030]">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                {sending ? 'Iniciando sesión...' : t('auth.loginBtn')}
              </button>
            )}
          </form>

          {/* Register dual buttons */}
          {mode === 'register' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => sendOtp('trial')}
                disabled={sending}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-[#7c5ff035] bg-[#7c5ff010] hover:bg-[#7c5ff018] disabled:opacity-50 transition-colors"
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
                {sending && intent === 'trial' ? <Loader2 size={14} className="text-[#a78bfa] animate-spin" /> : <ArrowRight size={14} className="text-[#6b6b7a]" />}
              </button>

              <button
                type="button"
                onClick={() => sendOtp('pay')}
                disabled={sending}
                className="w-full accent-gradient flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-[#7c5ff030]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {sending && intent === 'pay'
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

          <button type="button" onClick={switchMode} className="text-xs text-[#6b6b7a] hover:text-[#a0a0b0] transition-colors text-center pt-1">
            {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
          </button>
        </div>

        <p className="text-center text-[11px] text-[#38383f] mt-6">Gestión de personal para construcción</p>
      </div>
    </div>
  )
}
