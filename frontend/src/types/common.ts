export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}
