interface Props {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 24 }}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          disabled={p === page}
          style={{
            width: 32,
            height: 32,
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            fontSize: 13,
            cursor: p === page ? 'default' : 'pointer',
            background: p === page ? '#6236FF' : '#FFFFFF',
            color: p === page ? '#FFFFFF' : '#555555',
            borderColor: p === page ? '#6236FF' : '#E0E0E0',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
