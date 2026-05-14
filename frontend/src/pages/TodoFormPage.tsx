import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateTodo, useUpdateTodo } from '../hooks/useTodos'
import { useCategories } from '../hooks/useCategories'
import { getTodoById } from '../api/todoApi'
import { ROUTES } from '../constants/routes'

const TITLE_MAX = 200
const DESC_MAX = 2000

export default function TodoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: categories = [] } = useCategories()
  const { mutate: create, isPending: isCreating } = useCreateTodo()
  const { mutate: update, isPending: isUpdating } = useUpdateTodo()
  const isPending = isCreating || isUpdating

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isLoadingTodo, setIsLoadingTodo] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !id) return
    getTodoById(Number(id))
      .then((todo) => {
        setTitle(todo.title)
        setDescription(todo.description ?? '')
        setCategoryId(todo.categoryId)
        setDueDate(todo.dueDate)
      })
      .catch(() => setError('할일 정보를 불러오지 못했습니다.'))
      .finally(() => setIsLoadingTodo(false))
  }, [id, isEdit])

  function validate(): boolean {
    if (!title.trim()) { setError('제목을 입력해주세요.'); return false }
    if (title.length > TITLE_MAX) { setError(`제목은 ${TITLE_MAX}자 이내로 입력해주세요.`); return false }
    if (description.length > DESC_MAX) { setError(`설명은 ${DESC_MAX}자 이내로 입력해주세요.`); return false }
    if (!categoryId) { setError('카테고리를 선택해주세요.'); return false }
    if (!dueDate) { setError('종료 예정일을 입력해주세요.'); return false }
    return true
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: Number(categoryId),
      dueDate,
    }

    if (isEdit && id) {
      update(
        { id: Number(id), data },
        { onSuccess: () => navigate(ROUTES.TODOS) },
      )
    } else {
      create(data, { onSuccess: () => navigate(ROUTES.TODOS) })
    }
  }

  if (isLoadingTodo) return <div style={styles.page}>불러오는 중...</div>

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>{isEdit ? '할일 수정' : '새 할일'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          제목 <span style={styles.required}>*</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            required
            style={styles.input}
          />
          <span style={styles.counter}>{title.length} / {TITLE_MAX}</span>
        </label>

        <label style={styles.label}>
          설명
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={DESC_MAX}
            rows={4}
            style={styles.textarea}
          />
          <span style={styles.counter}>{description.length} / {DESC_MAX}</span>
        </label>

        <label style={styles.label}>
          카테고리 <span style={styles.required}>*</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
            style={styles.select}
          >
            <option value="">카테고리 선택</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          종료 예정일 <span style={styles.required}>*</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button type="button" onClick={() => navigate(-1)} style={styles.btnSecondary}>
            취소
          </button>
          <button type="submit" disabled={isPending} style={styles.btnPrimary}>
            {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 560 },
  heading: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--text-primary)' },
  required: { color: 'var(--danger)', marginLeft: 2 },
  input: {
    height: 36,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 10px',
    fontSize: 14,
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  },
  textarea: {
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '8px 10px',
    fontSize: 14,
    resize: 'vertical',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  },
  select: {
    height: 36,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 8px',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
  },
  counter: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' },
  error: { fontSize: 13, color: 'var(--danger)', margin: 0 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnPrimary: {
    height: 40,
    padding: '0 24px',
    background: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondary: {
    height: 40,
    padding: '0 24px',
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 20,
    fontSize: 14,
    cursor: 'pointer',
  },
}
