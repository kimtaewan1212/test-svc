import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { background: '#6236FF', color: '#FFFFFF', border: 'none' },
  secondary: { background: 'transparent', color: '#1A1A1A', border: '1px solid #CCCCCC' },
  danger: { background: 'transparent', color: '#FF4545', border: '1px solid #FF4545' },
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        height: 36,
        padding: '0 20px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: variant === 'primary' ? 600 : 400,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? '처리 중...' : children}
    </button>
  )
}
