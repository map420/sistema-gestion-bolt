// src/hooks/usePDF.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const html2pdf = require('html2pdf.js')

export function usePDF() {
  const exportar = (elementId: string, nombreArchivo: string) => {
    const el = document.getElementById(elementId)
    if (!el) return
    html2pdf().set({
      margin: 10,
      filename: `${nombreArchivo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
    }).from(el).save()
  }
  return { exportar }
}
