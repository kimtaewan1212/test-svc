import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMe, useUpdateMe, useDeleteMe } from '../hooks/useUser'
import { useAuthStore } from '../stores/authStore'
import { isValidPassword } from '../utils/validationUtils'
import { getErrorMessage } from '../constants/errorMessages'
import { ROUTES } from '../constants/routes'
import type { ApiError } from '../types/common'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
    if (!name.trim()) { setNameError(t('settings.name_required')); return }
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
    if (!currentPassword) { setPwError(t('settings.current_password_required')); return }
    if (!isValidPassword(newPassword)) {
      setPwError(t('settings.new_password_invalid'))
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
    if (!window.confirm(t('settings.delete_confirm'))) return
    deleteMe(undefined, {
      onSuccess: () => { clearAuth(); navigate(ROUTES.LOGIN) },
    })
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.pageHeading}>{t('settings.title')}</h2>

      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>{t('settings.edit_name')}</h3>
        <form onSubmit={handleNameSubmit} style={styles.form}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={me?.name}
            style={styles.input}
          />
          {nameError && <p style={styles.error}>{nameError}</p>}
          {nameSuccess && <p style={styles.success}>{t('settings.name_changed')}</p>}
          <button type="submit" disabled={isUpdating} style={styles.btnPrimary}>{t('common.save')}</button>
        </form>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionHeading}>{t('settings.change_password')}</h3>
        <form onSubmit={handlePasswordSubmit} style={styles.form}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('settings.current_password')}
            style={styles.input}
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('settings.new_password')}
            style={styles.input}
          />
          {pwError && <p style={styles.error}>{pwError}</p>}
          {pwSuccess && <p style={styles.success}>{t('settings.password_changed')}</p>}
          <button type="submit" disabled={isUpdating} style={styles.btnPrimary}>{t('common.save')}</button>
        </form>
      </section>

      <section style={{ ...styles.section, borderColor: 'var(--danger)' }}>
        <h3 style={{ ...styles.sectionHeading, color: 'var(--danger)' }}>{t('settings.delete_account')}</h3>
        <p style={styles.warningText}>{t('settings.delete_warning')}</p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          style={styles.btnDanger}
        >
          {isDeleting ? t('common.processing') : t('settings.delete_account')}
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
