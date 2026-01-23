export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'
export type PostmortemStatus = 'draft' | 'generating' | 'completed' | 'failed'
export type EventType = 'detection' | 'response' | 'mitigation' | 'resolution' | 'event'
export type Priority = 'high' | 'medium' | 'low'
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
  question: string
  answer: string
}

export interface ActionItem {
  id: string
  description: string
  owner: string
  dueDate: string
  priority: Priority
  status: ActionItemStatus
}

export interface Postmortem {
  id: string
  title: string
  severity: Severity
  incidentDate: string
  status: PostmortemStatus
  
  // Inputs
  slackThread?: string
  logs?: string
  notes?: string
  
  // Generated content
  summary?: string
  timeline: TimelineEvent[]
  impact?: string
  rootCause?: string
  whys: WhyItem[]
  wentWell: string[]
  wentPoorly: string[]
  actionItems: ActionItem[]
  
  createdAt: string
  updatedAt: string
}

export interface PostmortemInput {
  title: string
  severity: Severity
  incidentDate: string
  slackThread?: string
  logs?: string
  notes?: string
}

export interface PostmortemListItem {
  id: string
  title: string
  severity: Severity
  incidentDate: string
  status: PostmortemStatus
  duration?: number
  createdAt: string
}
