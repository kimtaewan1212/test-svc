import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import es from './locales/es'
import ja from './locales/ja'
import ko from './locales/ko'
import zh from './locales/zh'

const savedLang = localStorage.getItem('language') ?? 'ko'

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ja: { translation: ja },
    ko: { translation: ko },
    zh: { translation: zh },
  },
  lng: savedLang,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
})

export default i18next
