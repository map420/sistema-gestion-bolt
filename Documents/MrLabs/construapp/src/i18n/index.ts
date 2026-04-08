import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'
import pt from './locales/pt.json'
import { loadConfig, getSession, setCurrentUser } from '../storage'

// Set current user from session before reading config.
// This module runs at import time (before React renders), so we must
// restore the userId manually so loadConfig() reads the right namespaced key.
const session = getSession()
if (session) setCurrentUser(session.id)

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: loadConfig().idioma ?? 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

export default i18n
