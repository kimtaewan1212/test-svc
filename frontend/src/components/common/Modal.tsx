interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Modal({
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.btnCancel}>{cancelLabel}</button>
          <button onClick={onConfirm} style={styles.btnConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  dialog: {
    background: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    width: 320,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  },
  title: { fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 },
  message: { fontSize: 14, color: '#555555', marginBottom: 20, lineHeight: 1.6 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnCancel: {
    height: 36,
    padding: '0 16px',
    background: 'transparent',
    color: '#1A1A1A',
    border: '1px solid #CCCCCC',
    borderRadius: 18,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnConfirm: {
    height: 36,
    padding: '0 16px',
    background: '#6236FF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 18,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
