const WA_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const MOCK = !PHONE_NUMBER_ID || !ACCESS_TOKEN

export type WaSendResult = { success: boolean; messageId?: string; mock?: boolean }

export async function sendWhatsAppMessage(to: string, body: string): Promise<WaSendResult> {
  if (MOCK) {
    console.log(`[WA MOCK] To: ${to}\n${body}`)
    return { success: true, mock: true }
  }

  const res = await fetch(`${WA_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // strip non-digits
      type: 'text',
      text: { body },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[WA ERROR]', err)
    return { success: false }
  }

  const data = await res.json()
  return { success: true, messageId: data.messages?.[0]?.id }
}

export function buildReminder1(paciente: string, dentista: string, fecha: Date, clinica: string): string {
  const hora = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
  const dia = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  return `Hola ${paciente} 👋\n\nTe recordamos que tienes una cita mañana *${dia}* a las *${hora}* con *${dentista}* en *${clinica}*.\n\nResponde:\n✅ *SÍ* — para confirmar\n❌ *NO* — para cancelar\n\nSi no respondes, te enviaremos un recordatorio 2 horas antes.`
}

export function buildReminder2(paciente: string, dentista: string, fecha: Date, clinica: string): string {
  const hora = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `Hola ${paciente} 👋\n\nTu cita de hoy a las *${hora}* con *${dentista}* en *${clinica}* es en 2 horas.\n\nResponde:\n✅ *SÍ* — confirmar\n❌ *NO* — cancelar`
}

export function buildCancellationAlert(paciente: string, hora: string): string {
  return `⚠️ *Cita cancelada*\n\n${paciente} canceló su cita de las ${hora}. Puedes llamar a alguien de tu lista de espera.`
}
