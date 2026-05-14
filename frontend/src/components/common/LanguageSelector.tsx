import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language.split('-')[0]

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <select value={currentLang} onChange={handleChange} style={styles.select}>
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>{lang.label}</option>
      ))}
    </select>
  )
}

const styles: Record<string, React.CSSProperties> = {
  select: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '3px 6px',
    cursor: 'pointer',
  },
}
