'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { TimelineEvent, EventType } from '@/types'
import { cn, formatDateTime, generateId } from '@/lib/utils'

interface TimelineTableProps {
  events: TimelineEvent[]
  onEventsChange?: (events: TimelineEvent[]) => void
  editable?: boolean
}

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  detection: { label: 'Detection', color: 'bg-yellow-500/20 text-yellow-500' },
  response: { label: 'Response', color: 'bg-blue-500/20 text-blue-500' },
  mitigation: { label: 'Mitigation', color: 'bg-orange-500/20 text-orange-500' },
  resolution: { label: 'Resolution', color: 'bg-green-500/20 text-green-500' },
  event: { label: 'Event', color: 'bg-gray-500/20 text-gray-400' },
}

export function TimelineTable({ events, onEventsChange, editable }: TimelineTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddEvent = () => {
    const newEvent: TimelineEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      description: '',
      eventType: 'event',
      source: '',
    }
    onEventsChange?.([...events, newEvent])
    setEditingId(newEvent.id)
  }

  const handleUpdateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    onEventsChange?.(
      events.map(e => (e.id === id ? { ...e, ...updates } : e))
    )
  }

  const handleDeleteEvent = (id: string) => {
    onEventsChange?.(events.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[120px]">Source</TableHead>
              {editable && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={editable ? 5 : 4} className="text-center text-muted-foreground py-8">
                  No timeline events
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">
                    {editingId === event.id && editable ? (
                      <Input
                        type="datetime-local"
                        value={event.timestamp.slice(0, 16)}
                        onChange={(e) =>
                          handleUpdateEvent(event.id, {
                            timestamp: new Date(e.target.value).toISOString(),
                          })
                        }
                        className="h-8 text-xs"
                      />
                    ) : (
                      formatDateTime(event.timestamp)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === event.id && editable ? (
                      <Input
                        value={event.description}
                        onChange={(e) =>
                          handleUpdateEvent(event.id, { description: e.target.value })
                        }
                        className="h-8"
                        placeholder="Event description"
                      />
                    ) : (
                      event.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === event.id && editable ? (
                      <Select
                        value={event.eventType}
                        onValueChange={(v) =>
                          handleUpdateEvent(event.id, { eventType: v as EventType })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn('text-xs', EVENT_TYPE_CONFIG[event.eventType].color)}
                      >
                        {EVENT_TYPE_CONFIG[event.eventType].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {editingId === event.id && editable ? (
                      <Input
                        value={event.source || ''}
                        onChange={(e) =>
                          handleUpdateEvent(event.id, { source: e.target.value })
                        }
                        className="h-8 text-xs"
                        placeholder="Source"
                      />
                    ) : (
                      event.source || '-'
                    )}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {editingId === event.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="h-7 px-2 text-primary"
                          >
                            Done
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(event.id)}
                            className="h-7 px-2"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-7 px-2 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <Button variant="outline" size="sm" onClick={handleAddEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      )}
    </div>
  )
}
