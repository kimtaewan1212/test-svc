import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMe, useUpdateMe, useDeleteMe } from '../hooks/useUser'
import { useAuthStore } from '../stores/authStore'
import { isValidPassword } from '../utils/validationUtils'
import { getErrorMessage } from '../constants/errorMessages'
import { ROUTES } from '../constants/routes'
import type { ApiError } from '../types/common'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { mutate: updateMe, isPending: isUpdating } = useUpdateMe()
  const { mutate: deleteMe, isPending: isDeleting } = useDeleteMe()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const [name, setName] = useState(me?.name ?? '')
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    setNameError('')
    setNameSuccess(false)
    if (!name.trim()) { setNameError('이름을 입력해주세요.'); return }
    updateMe(
      { name: name.trim() },
      {
        onSuccess: () => setNameSuccess(true),
        onError: (err) => {
          const apiErr = err as unknown as { error: ApiError }
          setNameError(getErrorMessage(apiErr?.error?.code ?? ''))
        },
      },
    )
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (!currentPassword) { setPwError('현재 비밀번호를 입력해주세요.'); return }
    if (!isValidPassword(newPassword)) {
      setPwError('새 비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.')
      return
    }
    updateMe(
      { currentPassword, newPassword },
      {
        onSuccess: () => { setPwSuccess(true); setCurrentPassword(''); setNewPassword('') },
        onError: (err) => {
          const apiErr = err as unknown as { error: ApiError }
          setPwError(getErrorMessage(apiErr?.error?.code ?? ''))
        },
      },
    )
  }

  function handleDeleteAccount() {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n모든 데이터가 즉시 삭제됩니다.')) return
    deleteMe(undefined, {
      onSuccess: () => { clearAuth(); navigate(ROUTES.LOGIN) },
    })
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.pageHeading}>설정</h2>

      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>이름 수정</h3>
        <form onSubmit={handleNameSubmit} style={styles.form}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={me?.name}
            style={styles.input}
          />
          {nameError && <p style={styles.error}>{nameError}</p>}
          {nameSuccess && <p style={styles.success}>이름이 변경되었습니다.</p>}
          <button type="submit" disabled={isUpdating} style={styles.btnPrimary}>저장</button>
        </form>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>비밀번호 변경</h3>
        <form onSubmit={handlePasswordSubmit} style={styles.form}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호"
            style={styles.input}
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
            style={styles.input}
          />
          {pwError && <p style={styles.error}>{pwError}</p>}
          {pwSuccess && <p style={styles.success}>비밀번호가 변경되었습니다.</p>}
          <button type="submit" disabled={isUpdating} style={styles.btnPrimary}>변경</button>
        </form>
      </section>

      <section style={{ ...styles.section, borderColor: 'var(--danger)' }}>
        <h3 style={{ ...styles.sectionHeading, color: 'var(--danger)' }}>회원탈퇴</h3>
        <p style={styles.warningText}>탈퇴 시 모든 할일과 카테고리 데이터가 즉시 삭제되며 복구할 수 없습니다.</p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          style={styles.btnDanger}
        >
          {isDeleting ? '처리 중...' : '회원탈퇴'}
        </button>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 480 },
  pageHeading: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 },
  section: {
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    background: 'var(--bg-surface)',
  },
  sectionHeading: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    height: 36,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 10px',
    fontSize: 14,
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  },
  error: { fontSize: 13, color: 'var(--danger)', margin: 0 },
  success: { fontSize: 13, color: 'var(--success)', margin: 0 },
  warningText: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 },
  btnPrimary: {
    alignSelf: 'flex-start',
    height: 36,
    padding: '0 20px',
    background: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDanger: {
    height: 36,
    padding: '0 20px',
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    borderRadius: 20,
    fontSize: 14,
    cursor: 'pointer',
  },
}
