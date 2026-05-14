import { useTranslation } from 'react-i18next'
import CategoryBadge from '../category/CategoryBadge'
import type { TodoItem } from '../../types/todo'
import type { Category } from '../../types/category'

interface Props {
  todo: TodoItem
  categories: Category[]
  onToggle: (id: number) => void
}

export default function TodoCard({ todo, categories, onToggle }: Props) {
  const { t } = useTranslation()
  const category = categories.find((c) => c.id === todo.categoryId)

  return (
    <div style={{ ...styles.card, opacity: todo.isCompleted ? 0.6 : 1 }}>
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo.id)}
        style={styles.checkbox}
      />
      <div style={styles.body}>
        <span style={{ ...styles.title, textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
          {todo.title}
        </span>
        <div style={styles.meta}>
          {category && <CategoryBadge color={category.color} name={category.name} />}
          <span style={styles.dueDate}>
            {todo.dueDate ? `~ ${todo.dueDate}` : t('todo.no_due_date')}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'var(--bg-surface)',
  },
  checkbox: { marginTop: 2, width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0, cursor: 'pointer' },
  body: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 },
  title: { fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-word' },
  meta: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-secondary)' },
  dueDate: { color: 'var(--text-muted)', fontSize: 12 },
}
