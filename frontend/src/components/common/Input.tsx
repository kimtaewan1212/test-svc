import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  errorMessage?: string
}

export default function Input({ label, errorMessage, required, id, style, ...rest }: Props) {
  const inputId = id ?? label

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={inputId} style={{ fontSize: 14, color: '#1A1A1A' }}>
        {label}
        {required && <span style={{ color: '#FF4545', marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        style={{
          height: 36,
          border: `1px solid ${errorMessage ? '#FF4545' : '#E0E0E0'}`,
          borderRadius: 4,
          padding: '0 10px',
          fontSize: 14,
          outline: 'none',
          ...style,
        }}
        {...rest}
      />
      {errorMessage && (
        <span style={{ fontSize: 12, color: '#FF4545' }}>{errorMessage}</span>
      )}
    </div>
  )
}
