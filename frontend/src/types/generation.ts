export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationStep {
  id: string
  message: string
  timestamp: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

export interface GenerationProgress {
  taskId: string
  status: GenerationStatus
  currentStep: string
  progress: number
  steps: GenerationStep[]
  postmortemId?: string
  error?: string
}
