import type { TodoStatus, TodoPeriod } from '../types/todo'

export const STATUS_OPTIONS: { value: TodoStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'undone', label: '미완료' },
  { value: 'done', label: '완료' },
]

export const PERIOD_OPTIONS: { value: TodoPeriod; label: string }[] = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: 'overdue', label: '기한 초과' },
  { value: 'upcoming', label: '예정' },
]
