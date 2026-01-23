export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface CreatePostmortemResponse {
  taskId: string
  postmortemId: string
}

export interface ExportResponse {
  content: string
  filename: string
  format: 'markdown' | 'google-docs' | 'confluence'
}

export type ExportFormat = 'markdown' | 'google-docs' | 'confluence'
