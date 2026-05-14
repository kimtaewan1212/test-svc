import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTodos, useToggleTodo } from '../hooks/useTodos'
import { useCategories } from '../hooks/useCategories'
import TodoCard from '../components/todo/TodoCard'
import FilterBar from '../components/todo/FilterBar'
import type { TodoFilter } from '../types/todo'
import { ROUTES } from '../constants/routes'

const PAGE_LIMIT = 20

export default function TodoListPage() {
  const [filters, setFilters] = useState<TodoFilter>({ page: 1, limit: PAGE_LIMIT })
  const { data, isLoading, isError } = useTodos(filters)
  const { data: categories = [] } = useCategories()
  const { mutate: toggle } = useToggleTodo()

  const todos = data?.data ?? []
  const pagination = data?.pagination

  function handlePageChange(page: number) {
    setFilters((f) => ({ ...f, page }))
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>할일 목록</h2>
        <Link to={ROUTES.TODO_NEW} style={styles.btnNew}>+ 새 할일</Link>
      </div>

      <FilterBar filters={filters} categories={categories} onChange={setFilters} />

      {isLoading && <p style={styles.status}>불러오는 중...</p>}
      {isError && <p style={{ ...styles.status, color: 'var(--danger)' }}>오류가 발생했습니다.</p>}

      {!isLoading && !isError && (
        <>
          {todos.length === 0 ? (
            <p style={styles.status}>할일이 없습니다.</p>
          ) : (
            <ul style={styles.list}>
              {todos.map((todo) => (
                <li key={todo.id}>
                  <TodoCard todo={todo} categories={categories} onToggle={toggle} />
                </li>
              ))}
            </ul>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  style={{
                    ...styles.pageBtn,
                    ...(p === pagination.page ? styles.pageBtnActive : {}),
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 720 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' },
  btnNew: {
    height: 36,
    padding: '0 16px',
    background: 'var(--accent)',
    color: '#FFFFFF',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  status: { fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' },
  pagination: { display: 'flex', gap: 4, justifyContent: 'center', marginTop: 24 },
  pageBtn: {
    width: 32,
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 4,
    background: 'var(--bg-surface)',
    fontSize: 13,
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  pageBtnActive: {
    background: 'var(--accent)',
    color: '#FFFFFF',
    borderColor: 'var(--accent)',
  },
}
