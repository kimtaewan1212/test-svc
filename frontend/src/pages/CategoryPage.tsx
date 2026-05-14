import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import CategoryBadge from '../components/category/CategoryBadge'
import type { Category } from '../types/category'

const MAX_CATEGORIES = 20
const DEFAULT_COLOR = '#6B7280'

export default function CategoryPage() {
  const { t } = useTranslation()
  const { data: categories = [], isLoading } = useCategories()
  const { mutate: create, isPending: isCreating } = useCreateCategory()
  const { mutate: update } = useUpdateCategory()
  const { mutate: remove } = useDeleteCategory()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_COLOR)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const isAtMax = categories.length >= MAX_CATEGORIES

  function handleCreate() {
    if (!newName.trim()) return
    create(
      { name: newName.trim(), color: newColor },
      { onSuccess: () => { setNewName(''); setNewColor(DEFAULT_COLOR) } },
    )
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
  }

  function handleUpdate(id: number) {
    if (!editName.trim()) return
    update(
      { id, data: { name: editName.trim(), color: editColor } },
      { onSuccess: () => setEditingId(null) },
    )
  }

  function handleDelete(cat: Category) {
    if (!window.confirm(t('category.delete_confirm', { name: cat.name }))) return
    remove(cat.id)
  }

  if (isLoading) return <div style={styles.page}>{t('common.loading')}</div>

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>{t('category.manage')}</h2>

      <div style={styles.addRow}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('category.name_placeholder')}
          disabled={isAtMax}
          style={styles.input}
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          disabled={isAtMax}
          style={styles.colorPicker}
          title={t('category.name_placeholder')}
        />
        <button
          onClick={handleCreate}
          disabled={isAtMax || isCreating || !newName.trim()}
          style={styles.btnPrimary}
        >
          {isAtMax ? t('category.max', { count: MAX_CATEGORIES }) : t('common.add')}
        </button>
      </div>

      <ul style={styles.list}>
        {categories.map((cat) => (
          <li key={cat.id} style={styles.item}>
            {editingId === cat.id ? (
              <div style={styles.editRow}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  style={styles.colorPicker}
                />
                <button onClick={() => handleUpdate(cat.id)} style={styles.btnPrimary}>{t('common.save')}</button>
                <button onClick={() => setEditingId(null)} style={styles.btnSecondary}>{t('common.cancel')}</button>
              </div>
            ) : (
              <div style={styles.itemRow}>
                <CategoryBadge color={cat.color} name={cat.name} />
                {cat.isDefault && <span style={styles.defaultBadge}>{t('category.default')}</span>}
                <div style={styles.actions}>
                  <button onClick={() => startEdit(cat)} style={styles.btnSecondary}>{t('common.edit')}</button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={cat.isDefault}
                    style={{ ...styles.btnDanger, opacity: cat.isDefault ? 0.4 : 1 }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 600 },
  heading: { fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' },
  addRow: { display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' },
  editRow: { display: 'flex', gap: 8, alignItems: 'center', width: '100%' },
  input: {
    flex: 1,
    height: 36,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 10px',
    fontSize: 14,
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  },
  colorPicker: { width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 4, padding: 2, cursor: 'pointer' },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  item: { border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', background: 'var(--bg-surface)' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 10 },
  defaultBadge: {
    fontSize: 11,
    color: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: 10,
    padding: '1px 6px',
  },
  actions: { marginLeft: 'auto', display: 'flex', gap: 6 },
  btnPrimary: {
    height: 32,
    padding: '0 14px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 13,
    cursor: 'pointer',
  },
  btnSecondary: {
    height: 32,
    padding: '0 14px',
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 16,
    fontSize: 13,
    cursor: 'pointer',
  },
  btnDanger: {
    height: 32,
    padding: '0 14px',
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    borderRadius: 16,
    fontSize: 13,
    cursor: 'pointer',
  },
}
