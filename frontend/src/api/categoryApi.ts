import { request } from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category'

export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories')
}

export function createCategory(data: CreateCategoryRequest): Promise<Category> {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  return request<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteCategory(id: number): Promise<void> {
  return request<void>(`/categories/${id}`, { method: 'DELETE' })
}
