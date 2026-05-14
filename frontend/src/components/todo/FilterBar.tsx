import { useTranslation } from 'react-i18next'
import { STATUS_OPTIONS, PERIOD_OPTIONS } from '../../constants/filterOptions'
import type { Category } from '../../types/category'
import type { TodoFilter, TodoStatus, TodoPeriod } from '../../types/todo'

interface Props {
  filters: TodoFilter
  categories: Category[]
  onChange: (filters: TodoFilter) => void
}

export default function FilterBar({ filters, categories, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <div style={styles.bar}>
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) =>
          onChange({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined, page: 1 })
        }
        style={styles.select}
      >
        <option value="">{t('category.all')}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div style={styles.group}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, status: opt.value as TodoStatus, page: 1 })}
            style={{
              ...styles.tab,
              ...(filters.status === opt.value || (!filters.status && opt.value === 'all') ? styles.tabActive : {}),
            }}
          >
            {t(`filter.${opt.value}`)}
          </button>
        ))}
      </div>

      <div style={styles.group}>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, period: opt.value as TodoPeriod, page: 1 })}
            style={{
              ...styles.tab,
              ...(filters.period === opt.value || (!filters.period && opt.value === 'all') ? styles.tabActive : {}),
            }}
          >
            {t(`filter.${opt.value}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 },
  select: {
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0 8px',
    fontSize: 13,
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
  },
  group: { display: 'flex', gap: 0 },
  tab: {
    height: 32,
    padding: '0 12px',
    fontSize: 13,
    border: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  tabActive: {
    background: 'var(--accent)',
    color: '#FFFFFF',
    borderColor: 'var(--accent)',
  },
}
