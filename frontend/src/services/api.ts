import { mockApi } from './mock-api'
import type {
  Postmortem,
  PostmortemCreateRequest,
  PostmortemUpdateRequest,
  PostmortemSection,
  PaginatedResponse,
  CreatePostmortemResponse,
  GenerationStatus,
  ExportResponse,
  ExportFormat,
} from '@/types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

class ApiService {
  // Postmortems
  async getPostmortems(params: {
    page?: number
    limit?: number
    severity?: string
    search?: string
  }): Promise<PaginatedResponse<Postmortem>> {
    if (USE_MOCK) {
      return mockApi.getPostmortems(params)
    }

    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.severity) queryParams.set('severity', params.severity)
    if (params.search) queryParams.set('search', params.search)

    const response = await fetch(`${API_URL}/postmortems?${queryParams}`)
    if (!response.ok) throw new Error('Failed to fetch postmortems')
    return response.json()
  }

  async getPostmortem(id: string): Promise<Postmortem> {
    if (USE_MOCK) {
      return mockApi.getPostmortem(id)
    }

    const response = await fetch(`${API_URL}/postmortems/${id}`)
    if (!response.ok) throw new Error('Failed to fetch postmortem')
    return response.json()
  }

  async createPostmortem(data: PostmortemCreateRequest): Promise<CreatePostmortemResponse> {
    if (USE_MOCK) {
      return mockApi.createPostmortem(data)
    }

    const response = await fetch(`${API_URL}/postmortems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create postmortem')
    return response.json()
  }

  async updatePostmortem(id: string, data: PostmortemUpdateRequest): Promise<Postmortem> {
    if (USE_MOCK) {
      return mockApi.updatePostmortem(id, data)
    }

    const response = await fetch(`${API_URL}/postmortems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update postmortem')
    return response.json()
  }

  async deletePostmortem(id: string): Promise<void> {
    if (USE_MOCK) {
      return mockApi.deletePostmortem(id)
    }

    const response = await fetch(`${API_URL}/postmortems/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete postmortem')
  }

  // Generation
  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    if (USE_MOCK) {
      return mockApi.getGenerationStatus(taskId)
    }

    const response = await fetch(`${API_URL}/generation/${taskId}/status`)
    if (!response.ok) throw new Error('Failed to fetch generation status')
    return response.json()
  }

  async regenerateSection(postmortemId: string, section: PostmortemSection): Promise<{ taskId: string }> {
    if (USE_MOCK) {
      return mockApi.regenerateSection(postmortemId, section)
    }

    const response = await fetch(`${API_URL}/postmortems/${postmortemId}/sections/${section}/regenerate`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to regenerate section')
    return response.json()
  }

  // Export
  async exportPostmortem(id: string, format: ExportFormat): Promise<ExportResponse> {
    if (USE_MOCK) {
      return mockApi.exportPostmortem(id, format)
    }

    const response = await fetch(`${API_URL}/export/${id}/${format}`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to export postmortem')
    return response.json()
  }
}

export const api = new ApiService()
