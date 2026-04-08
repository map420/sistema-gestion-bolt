import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HardHat } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type Mode = 'login' | 'register'

export default function Login() {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!nombre.trim() || !password || !confirmPassword) {
        setError(t('auth.errRequired'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('auth.errPasswordMismatch'))
        return
      }
      const result = register(nombre, password)
      if (!result.ok && result.error) {
        setError(t(`auth.${result.error}`))
      }
    } else {
      if (!nombre.trim() || !password) {
        setError(t('auth.errRequired'))
        return
      }
      const result = login(nombre, password)
      if (!result.ok && result.error) {
        setError(t(`auth.${result.error}`))
      }
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
        <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#555] uppercase tracking-wide">{t('auth.username')}</label>
            <input
              type="text"
              autoComplete="username"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="usuario123"
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0] placeholder:text-[#333]"
            />
          </div>

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

          {error && (
            <p className="text-xs text-[#f87171] bg-[#f8717110] border border-[#f8717130] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-[#9d7ff0] hover:bg-[#8b6fd4] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1"
          >
            {mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>

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
