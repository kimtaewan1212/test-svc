import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRegister } from '../hooks/useAuth'
import { isValidEmail, isValidPassword } from '../utils/validationUtils'
import { getErrorMessage } from '../constants/errorMessages'
import type { ApiError } from '../types/common'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!isValidEmail(email)) {
      setErrorMsg('올바른 이메일 형식이 아닙니다.')
      return
    }
    if (!isValidPassword(password)) {
      setErrorMsg('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.')
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
        <h1 style={styles.title}>회원가입</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </label>
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
            <span style={styles.hint}>8자 이상, 영문+숫자 조합</span>
          </label>
          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
          <button type="submit" disabled={isPending} style={styles.button}>
            {isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p style={styles.link}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
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
