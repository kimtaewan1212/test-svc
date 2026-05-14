import { request } from './client'
import type { TodoItem, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types/todo'
import type { PaginatedResponse } from '../types/common'

function buildQuery(filters: TodoFilter): string {
  const params = new URLSearchParams()
  if (filters.categoryId !== undefined) params.set('categoryId', String(filters.categoryId))
  if (filters.status) params.set('status', filters.status)
  if (filters.period) params.set('period', filters.period)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.order) params.set('order', filters.order)
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function getTodos(filters: TodoFilter = {}): Promise<PaginatedResponse<TodoItem>> {
  return request<PaginatedResponse<TodoItem>>(`/todos${buildQuery(filters)}`)
}

export function getTodoById(id: number): Promise<TodoItem> {
  return request<TodoItem>(`/todos/${id}`)
}

export function createTodo(data: CreateTodoRequest): Promise<TodoItem> {
  return request<TodoItem>('/todos', { method: 'POST', body: JSON.stringify(data) })
}

export function updateTodo(id: number, data: UpdateTodoRequest): Promise<TodoItem> {
  return request<TodoItem>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteTodo(id: number): Promise<void> {
  return request<void>(`/todos/${id}`, { method: 'DELETE' })
}

export function toggleTodoComplete(id: number): Promise<TodoItem> {
  return request<TodoItem>(`/todos/${id}/done`, { method: 'PATCH' })
}
