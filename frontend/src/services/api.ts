/**
 * API Service for communicating with the backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

import { Postmortem } from '@/types/postmortem';
import { getPostmortemById, getAllPostmortems } from './mock-data';

interface CreatePostmortemRequest {
  title: string;
  severity: string;
  incidentDate: string;
  slackThread?: string;
  logs?: string;
  notes?: string;
}

interface CreatePostmortemResponse {
  taskId: string;
  postmortemId: string;
}

interface GenerationStatus {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  currentStep: string | null;
  error: string | null;
}

interface PostmortemListResponse {
  items: Postmortem[];
  total: number;
  page: number;
  pages: number;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  /**
   * Create a new postmortem and start generation.
   */
  async createPostmortem(data: CreatePostmortemRequest): Promise<CreatePostmortemResponse> {
    if (USE_MOCK_DATA) {
      // Simulate API call with mock data
      return {
        taskId: 'mock-task-id',
        postmortemId: 'demo-1',
      };
    }

    return fetchApi<CreatePostmortemResponse>('/postmortems', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        severity: data.severity,
        incidentDate: data.incidentDate,
        slackThread: data.slackThread || '',
        logs: data.logs,
        notes: data.notes,
      }),
    });
  },

  /**
   * Get generation task status.
   */
  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    if (USE_MOCK_DATA) {
      // Simulate completed status
      return {
        status: 'completed',
        progress: 100,
        currentStep: 'Complete!',
        error: null,
      };
    }

    return fetchApi<GenerationStatus>(`/generation/${taskId}/status`);
  },

  /**
   * Get a postmortem by ID.
   */
  async getPostmortem(id: string): Promise<Postmortem | null> {
    if (USE_MOCK_DATA) {
      const mockData = getPostmortemById(id);
      return mockData || null;
    }

    try {
      const response = await fetchApi<any>(`/postmortems/${id}`);
      return transformApiResponse(response);
    } catch (error) {
      console.error('Failed to fetch postmortem:', error);
      return null;
    }
  },

  /**
   * List all postmortems.
   */
  async listPostmortems(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PostmortemListResponse> {
    if (USE_MOCK_DATA) {
      const allPostmortems = getAllPostmortems();
      const filtered = search
        ? allPostmortems.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase())
          )
        : allPostmortems;

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pages: 1,
      };
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);

    const response = await fetchApi<any>(`/postmortems?${params}`);

    return {
      items: response.items.map(transformApiResponse),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },

  /**
   * Delete a postmortem.
   */
  async deletePostmortem(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }

    await fetchApi(`/postmortems/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Regenerate a specific section.
   */
  async regenerateSection(
    postmortemId: string,
    section: string
  ): Promise<{ taskId: string }> {
    if (USE_MOCK_DATA) {
      return { taskId: 'mock-task-id' };
    }

    return fetchApi(`/postmortems/${postmortemId}/sections/${section}/regenerate`, {
      method: 'POST',
    });
  },
};

/**
 * Transform API response to frontend Postmortem type.
 */
function transformApiResponse(data: any): Postmortem {
  return {
    id: data.id,
    title: data.title,
    severity: data.severity,
    incidentDate: data.incidentDate,
    status: data.status,
    duration: parseInt(data.duration) || 0,
    slackThread: data.slackThread,
    logs: data.logs,
    notes: data.notes,
    summary: data.summary,
    impact: data.impact,
    rootCause: data.rootCause,
    timeline: (data.timeline || []).map((t: any) => ({
      timestamp: t.timestamp,
      event: t.description || t.event,
      actor: t.source || t.actor || '',
    })),
    whys: (data.whys || []).map((w: any) => ({
      question: w.why || w.question,
      answer: w.answer,
    })),
    lessonsLearned: data.wentWell || data.lessonsLearned || [],
    actionItems: (data.actionItems || []).map((a: any) => ({
      id: a.id,
      description: a.description,
      owner: a.owner,
      priority: a.priority,
      status: a.status,
      dueDate: a.dueDate,
    })),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default api;
