export interface Category {
  id: number
  userId: number
  name: string
  color: string
  isDefault: boolean
  createdAt: string
}

export interface CreateCategoryRequest {
  name: string
  color?: string
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
}
