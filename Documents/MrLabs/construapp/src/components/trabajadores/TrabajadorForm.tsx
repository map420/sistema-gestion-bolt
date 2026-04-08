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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#f0f0f0]">{inicial ? t('form.editTitle') : t('form.newTitle')}</h2>
          <button onClick={onCerrar} className="text-[#555] hover:text-[#aaa]"><X size={18} /></button>
        </div>

        {error && <p className="text-xs text-[#f87171] bg-[#f8717115] border border-[#f8717130] rounded-lg px-3 py-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">{t('form.name')} *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={nombre} onChange={e => setNombre(e.target.value)} placeholder={t('form.namePh')} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">{t('form.trade')} *</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={oficio} onChange={e => setOficio(e.target.value)} placeholder={t('form.tradePh')} />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">{t('form.payType')} *</span>
            <div className="flex gap-2">
              {(['dia', 'hora'] as TipoPago[]).map(tp => (
                <button key={tp} onClick={() => setTipoPago(tp)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${tipoPago === tp ? 'bg-[#9d7ff020] border-[#9d7ff050] text-[#9d7ff0]' : 'bg-[#0d0d0d] border-white/10 text-[#555] hover:text-[#aaa]'}`}>
                  {tp === 'dia' ? t('form.perDay') : t('form.perHour')}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">{t('form.rate', { unit: tipoPago === 'dia' ? t('form.perDay').toLowerCase().replace('per ', '').replace('por ', '') : t('form.perHour').toLowerCase().replace('per ', '').replace('por ', '') })} *</span>
            <input type="number" min="0" className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={tarifa} onChange={e => setTarifa(e.target.value)} placeholder="180" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#555] uppercase tracking-wide">{t('form.phone')}</span>
            <input className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f0f0f0] focus:outline-none focus:border-[#9d7ff0]" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="8888-0000" />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onCerrar} className="flex-1 py-2 rounded-lg text-sm border border-white/10 text-[#666] hover:text-[#aaa]">{t('form.cancel')}</button>
          <button onClick={handleGuardar} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#9d7ff0] text-white hover:bg-[#8b6fd4] transition-colors">{t('form.save')}</button>
        </div>
      </div>
    </div>
  )
}
