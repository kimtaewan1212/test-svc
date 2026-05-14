import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { getErrorMessage } from '../constants/errorMessages'
import type { ApiError } from '../types/common'

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    login(
      { email, password },
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
        <h1 style={styles.title}>TodoListApp</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          <button type="submit" disabled={isPending} style={styles.button}>
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p style={styles.link}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
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
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--accent)',
    marginBottom: 24,
    textAlign: 'center',
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
