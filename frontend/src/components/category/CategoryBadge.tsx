interface Props {
  color: string
  name: string
}

export default function CategoryBadge({ color, name }: Props) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }}
      />
      {name}
    </span>
  )
}
