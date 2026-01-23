export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'

export type PostmortemStatus = 'draft' | 'generating' | 'completed' | 'failed'

export type EventType = 'detection' | 'response' | 'mitigation' | 'resolution' | 'event'

export type ActionItemPriority = 'high' | 'medium' | 'low'

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface TimelineEvent {
  id: string
  timestamp: string
  description: string
  eventType: EventType
  source?: string
}

export interface WhyItem {
  id: string
  why: string
  answer: string
}

export interface ActionItem {
  id: string
  description: string
  owner: string
  dueDate: string
  priority: ActionItemPriority
  status: ActionItemStatus
}

export interface Postmortem {
  id: string
  title: string
  severity: Severity
  incidentDate: string
  status: PostmortemStatus

  // Input fields
  slackThread?: string
  logs?: string
  notes?: string

  // Generated content
  summary?: string
  timeline?: TimelineEvent[]
  impact?: string
  rootCause?: string
  whys?: WhyItem[]
  wentWell?: string[]
  wentPoorly?: string[]
  actionItems?: ActionItem[]

  // Metadata
  generationTaskId?: string
  duration?: string
  createdAt: string
  updatedAt: string
}

export interface PostmortemCreateRequest {
  title: string
  severity: Severity
  incidentDate: string
  slackThread: string
  logs?: string
  notes?: string
}

export interface PostmortemUpdateRequest {
  title?: string
  severity?: Severity
  incidentDate?: string
  summary?: string
  impact?: string
  rootCause?: string
  whys?: WhyItem[]
  wentWell?: string[]
  wentPoorly?: string[]
  timeline?: TimelineEvent[]
  actionItems?: ActionItem[]
}

export type PostmortemSection =
  | 'summary'
  | 'timeline'
  | 'impact'
  | 'rootCause'
  | 'whys'
  | 'wentWell'
  | 'wentPoorly'
  | 'actionItems'

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; variant: 'sev1' | 'sev2' | 'sev3' | 'sev4' }> = {
  SEV1: { label: 'SEV1 - Critical', color: '#FF3B3B', variant: 'sev1' },
  SEV2: { label: 'SEV2 - Major', color: '#FF9500', variant: 'sev2' },
  SEV3: { label: 'SEV3 - Minor', color: '#FFD60A', variant: 'sev3' },
  SEV4: { label: 'SEV4 - Low', color: '#39FF14', variant: 'sev4' },
}
