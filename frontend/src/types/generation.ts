export type GenerationStatusType = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationStatus {
  status: GenerationStatusType
  progress: number
  currentStep?: string
  error?: string
}

export interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
  message?: string
  timestamp?: string
}

export const GENERATION_STEPS: Omit<GenerationStep, 'status' | 'timestamp'>[] = [
  { id: 'parse', label: 'Parsing input data...', message: '[PARSE] Analyzing Slack thread and logs...' },
  { id: 'extract', label: 'Extracting timeline...', message: '[EXTRACT] Building chronological event sequence...' },
  { id: 'analyze', label: 'Analyzing root cause...', message: '[ANALYZE] Identifying primary and contributing factors...' },
  { id: 'whys', label: 'Performing 5 Whys analysis...', message: '[WHYS] Deep diving into causation chain...' },
  { id: 'impact', label: 'Assessing impact...', message: '[IMPACT] Calculating affected services and users...' },
  { id: 'actions', label: 'Generating action items...', message: '[ACTIONS] Recommending preventive measures...' },
  { id: 'summary', label: 'Writing executive summary...', message: '[SUMMARY] Synthesizing findings...' },
  { id: 'finalize', label: 'Finalizing postmortem...', message: '[COMPLETE] Document ready for review.' },
]
