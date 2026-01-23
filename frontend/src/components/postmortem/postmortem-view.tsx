'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Clock,
  AlertTriangle,
  Search,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ListTodo,
  ArrowLeft,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { CopyButton } from '@/components/shared/copy-button'
import { SectionCard } from './section-card'
import { TimelineTable } from './timeline-table'
import { WhysSection } from './whys-section'
import { ListSection } from './list-section'
import { ActionItemsTable } from './action-items-table'
import { ExportDropdown } from './export-dropdown'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils'
import type { Postmortem } from '@/types'

interface PostmortemViewProps {
  postmortemId: string
}

export function PostmortemView({ postmortemId }: PostmortemViewProps) {
  const router = useRouter()
  const [postmortem, setPostmortem] = useState<Postmortem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchPostmortem = async () => {
      try {
        const data = await api.getPostmortem(postmortemId)
        setPostmortem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load postmortem')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostmortem()
  }, [postmortemId])

  const handleUpdate = async (updates: Partial<Postmortem>) => {
    if (!postmortem) return

    try {
      const updated = await api.updatePostmortem(postmortemId, updates)
      setPostmortem(updated)
    } catch (err) {
      console.error('Failed to update postmortem:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading postmortem...</div>
      </div>
    )
  }

  if (error || !postmortem) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-destructive">{error || 'Postmortem not found'}</div>
        <Button variant="outline" onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/history')}
              className="h-8 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SeverityBadge severity={postmortem.severity} />
            <span className="text-muted-foreground text-sm">
              {formatDate(postmortem.incidentDate)}
            </span>
            {postmortem.duration && (
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {postmortem.duration}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-primary">{postmortem.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? 'Done Editing' : 'Edit'}
          </Button>
          <ExportDropdown postmortemId={postmortemId} />
        </div>
      </div>

      {/* Summary Section */}
      <SectionCard
        title="Executive Summary"
        icon={<FileText className="h-5 w-5" />}
        editable={isEditing}
        editValue={postmortem.summary}
        onEditSave={(value) => handleUpdate({ summary: value })}
        onRegenerate={() => api.regenerateSection(postmortemId, 'summary')}
      >
        <p className="text-foreground leading-relaxed">
          {postmortem.summary || 'No summary available.'}
        </p>
      </SectionCard>

      {/* Timeline Section */}
      <SectionCard
        title="Timeline"
        icon={<Clock className="h-5 w-5" />}
        onRegenerate={() => api.regenerateSection(postmortemId, 'timeline')}
      >
        <TimelineTable
          events={postmortem.timeline || []}
          onEventsChange={(events) => handleUpdate({ timeline: events })}
          editable={isEditing}
        />
      </SectionCard>

      {/* Impact Section */}
      <SectionCard
        title="Impact"
        icon={<AlertTriangle className="h-5 w-5" />}
        editable={isEditing}
        editValue={postmortem.impact}
        onEditSave={(value) => handleUpdate({ impact: value })}
        onRegenerate={() => api.regenerateSection(postmortemId, 'impact')}
      >
        <p className="text-foreground leading-relaxed">
          {postmortem.impact || 'No impact assessment available.'}
        </p>
      </SectionCard>

      {/* Root Cause Section */}
      <SectionCard
        title="Root Cause"
        icon={<Search className="h-5 w-5" />}
        editable={isEditing}
        editValue={postmortem.rootCause}
        onEditSave={(value) => handleUpdate({ rootCause: value })}
        onRegenerate={() => api.regenerateSection(postmortemId, 'rootCause')}
      >
        <p className="text-foreground leading-relaxed">
          {postmortem.rootCause || 'No root cause identified.'}
        </p>
      </SectionCard>

      {/* 5 Whys Section */}
      <SectionCard
        title="Root Cause Analysis (N Whys)"
        icon={<HelpCircle className="h-5 w-5" />}
        onRegenerate={() => api.regenerateSection(postmortemId, 'whys')}
      >
        <WhysSection
          whys={postmortem.whys || []}
          onWhysChange={(whys) => handleUpdate({ whys })}
          editable={isEditing}
        />
      </SectionCard>

      {/* What Went Well / What Went Poorly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title="What Went Well"
          icon={<ThumbsUp className="h-5 w-5 text-primary" />}
          onRegenerate={() => api.regenerateSection(postmortemId, 'wentWell')}
        >
          <ListSection
            items={postmortem.wentWell || []}
            onItemsChange={(items) => handleUpdate({ wentWell: items })}
            editable={isEditing}
            bulletStyle="check"
            emptyMessage="No items listed."
          />
        </SectionCard>

        <SectionCard
          title="What Went Poorly"
          icon={<ThumbsDown className="h-5 w-5 text-destructive" />}
          onRegenerate={() => api.regenerateSection(postmortemId, 'wentPoorly')}
        >
          <ListSection
            items={postmortem.wentPoorly || []}
            onItemsChange={(items) => handleUpdate({ wentPoorly: items })}
            editable={isEditing}
            bulletStyle="cross"
            emptyMessage="No items listed."
          />
        </SectionCard>
      </div>

      {/* Action Items Section */}
      <SectionCard
        title="Action Items"
        icon={<ListTodo className="h-5 w-5" />}
        onRegenerate={() => api.regenerateSection(postmortemId, 'actionItems')}
      >
        <ActionItemsTable
          items={postmortem.actionItems || []}
          onItemsChange={(items) => handleUpdate({ actionItems: items })}
          editable={isEditing}
        />
      </SectionCard>
    </div>
  )
}
