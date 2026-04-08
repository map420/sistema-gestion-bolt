import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { Trabajador, TipoPago } from '../../types'
import { uuid } from '../../utils'

interface Props {
  inicial?: Trabajador
  onGuardar: (t: Trabajador) => void
  onCerrar: () => void
}

export default function TrabajadorForm({ inicial, onGuardar, onCerrar }: Props) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [oficio, setOficio] = useState(inicial?.oficio ?? '')
  const [tipoPago, setTipoPago] = useState<TipoPago>(inicial?.tipoPago ?? 'dia')
  const [tarifa, setTarifa] = useState(inicial?.tarifa?.toString() ?? '')
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '')
  const [error, setError] = useState('')

  const handleGuardar = () => {
    if (!nombre.trim()) { setError(t('form.errName')); return }
    if (!oficio.trim()) { setError(t('form.errTrade')); return }
    if (!tarifa || isNaN(Number(tarifa)) || Number(tarifa) <= 0) { setError(t('form.errRate')); return }
    onGuardar({
      id: inicial?.id ?? uuid(),
      nombre: nombre.trim(),
      oficio: oficio.trim(),
      tipoPago,
      tarifa: Number(tarifa),
      telefono: telefono.trim() || undefined,
      activo: inicial?.activo ?? true,
    })
  }

  const inputClass = "w-full bg-[#07070a] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#f2f2f7] placeholder:text-[#38383f] transition-all"
  const labelClass = "text-[11px] font-semibold text-[#6b6b7a] uppercase tracking-wider"

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f13] border border-white/[0.07] rounded-2xl w-full max-w-md flex flex-col gap-5 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div>
            <h2 className="font-semibold text-[#f2f2f7]">{inicial ? t('form.editTitle') : t('form.newTitle')}</h2>
          </div>
          <button onClick={onCerrar} className="p-2 text-[#6b6b7a] hover:text-[#f2f2f7] rounded-xl hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {error && (
            <div className="bg-[#ff453a12] border border-[#ff453a25] rounded-xl px-4 py-3">
              <p className="text-xs text-[#ff6b6b]">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 flex flex-col gap-1.5">
              <span className={labelClass}>{t('form.name')} *</span>
              <input className={inputClass} value={nombre} onChange={e => setNombre(e.target.value)} placeholder={t('form.namePh')} />
            </label>
            <label className="col-span-2 flex flex-col gap-1.5">
              <span className={labelClass}>{t('form.trade')} *</span>
              <input className={inputClass} value={oficio} onChange={e => setOficio(e.target.value)} placeholder={t('form.tradePh')} />
            </label>
          </div>

          {/* Pay type */}
          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>{t('form.payType')} *</span>
            <div className="flex gap-2 p-1 bg-[#07070a] rounded-xl border border-white/[0.06]">
              {(['dia', 'hora'] as TipoPago[]).map(tp => (
                <button
                  key={tp}
                  onClick={() => setTipoPago(tp)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tipoPago === tp
                      ? 'accent-gradient text-white shadow-sm'
                      : 'text-[#6b6b7a] hover:text-[#a0a0b0]'
                  }`}
                >
                  {tp === 'dia' ? t('form.perDay') : t('form.perHour')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Tarifa *</span>
              <input type="number" min="0" className={inputClass} value={tarifa} onChange={e => setTarifa(e.target.value)} placeholder="180" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>{t('form.phone')}</span>
              <input className={inputClass} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="8888-0000" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCerrar}
              className="flex-1 py-3 rounded-xl text-sm font-medium border border-white/[0.07] text-[#6b6b7a] hover:text-[#a0a0b0] hover:border-white/[0.12] transition-all"
            >
              {t('form.cancel')}
            </button>
            <button
              onClick={handleGuardar}
              className="flex-1 py-3 rounded-xl text-sm font-semibold accent-gradient text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#7c5ff025]"
            >
              {t('form.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
