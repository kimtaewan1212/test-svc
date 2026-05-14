import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../hooks/useAuth'
import { isValidEmail, isValidPassword } from '../utils/validationUtils'
import { getErrorMessage } from '../constants/errorMessages'
import type { ApiError } from '../types/common'
import LanguageSelector from '../components/common/LanguageSelector'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { mutate: register, isPending } = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!isValidEmail(email)) {
      setErrorMsg(t('auth.email_invalid'))
      return
    }
    if (!isValidPassword(password)) {
      setErrorMsg(t('auth.password_invalid'))
      return
    }

    register(
      { name, email, password },
      {
        onSuccess: () => navigate('/todos'),
        onError: (err) => {
          const apiErr = err as unknown as { error: ApiError }
          setErrorMsg(getErrorMessage(apiErr?.error?.code ?? ''))
        },
      },
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>{t('auth.register')}</h1>
          <LanguageSelector />
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            {t('auth.name')}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            {t('auth.email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            {t('auth.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <span style={styles.hint}>{t('auth.password_hint')}</span>
          </label>
          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          <button type="submit" disabled={isPending} style={styles.button}>
            {isPending ? t('auth.registering') : t('auth.register')}
          </button>
        </form>
        <p style={styles.link}>
          {t('auth.has_account')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'var(--bg-subtle)',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 32,
    width: 360,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--accent)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--text-primary)' },
  input: {
    height: 36,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 10px',
    fontSize: 14,
    outline: 'none',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  },
  hint: { fontSize: 11, color: 'var(--text-muted)' },
  error: { fontSize: 13, color: 'var(--danger)', margin: 0 },
  button: {
    height: 40,
    background: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: { marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' },
}
