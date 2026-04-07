// src/hooks/usePDF.ts
import { useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const html2pdf = require('html2pdf.js')

export function usePDF() {
  const exportar = useCallback((elementId: string, nombreArchivo: string): Promise<void> | undefined => {
    const el = document.getElementById(elementId)
    if (!el) {
      console.error(`usePDF: element #${elementId} not found`)
      alert('Error al generar PDF. Intente de nuevo.')
      return
    }
    const baseName = nombreArchivo.replace(/\.pdf$/i, '')
    return html2pdf().set({
      margin: 10,
      filename: `${baseName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
    }).from(el).save()
  }, [])
  return { exportar }
}
