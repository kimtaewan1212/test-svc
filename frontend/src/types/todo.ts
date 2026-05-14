export interface TodoItem {
  id: number
  userId: number
  categoryId: number
  title: string
  description: string | null
  dueDate: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoRequest {
  title: string
  categoryId: number
  dueDate: string
  description?: string
}

export type UpdateTodoRequest = Partial<CreateTodoRequest>

export type TodoStatus = 'all' | 'done' | 'undone'
export type TodoPeriod = 'all' | 'today' | 'overdue' | 'upcoming'
export type TodoSort = 'due_date' | 'created_at'
export type TodoOrder = 'asc' | 'desc'

export interface TodoFilter {
  categoryId?: number
  status?: TodoStatus
  period?: TodoPeriod
  sort?: TodoSort
  order?: TodoOrder
  page?: number
  limit?: number
}
