import type { TodoStatus, TodoPeriod } from '../types/todo'

export const STATUS_OPTIONS: { value: TodoStatus }[] = [
  { value: 'all' },
  { value: 'undone' },
  { value: 'done' },
]

export const PERIOD_OPTIONS: { value: TodoPeriod }[] = [
  { value: 'all' },
  { value: 'today' },
  { value: 'overdue' },
  { value: 'upcoming' },
]
