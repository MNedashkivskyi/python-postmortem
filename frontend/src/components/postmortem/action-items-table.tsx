'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import type { ActionItem, ActionItemPriority, ActionItemStatus } from '@/types'
import { cn, generateId } from '@/lib/utils'

interface ActionItemsTableProps {
  items: ActionItem[]
  onItemsChange?: (items: ActionItem[]) => void
  editable?: boolean
}

const PRIORITY_CONFIG: Record<ActionItemPriority, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-500/20 text-red-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-500' },
  low: { label: 'Low', color: 'bg-green-500/20 text-green-500' },
}

const STATUS_CONFIG: Record<ActionItemStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-gray-500/20 text-gray-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-500' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
}

export function ActionItemsTable({ items, onItemsChange, editable }: ActionItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddItem = () => {
    const newItem: ActionItem = {
      id: generateId(),
      description: '',
      owner: '',
      dueDate: '',
      priority: 'medium',
      status: 'open',
    }
    onItemsChange?.([...items, newItem])
    setEditingId(newItem.id)
  }

  const handleUpdateItem = (id: string, updates: Partial<ActionItem>) => {
    onItemsChange?.(
      items.map(i => (i.id === id ? { ...i, ...updates } : i))
    )
  }

  const handleDeleteItem = (id: string) => {
    onItemsChange?.(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action Item</TableHead>
              <TableHead className="w-[120px]">Owner</TableHead>
              <TableHead className="w-[120px]">Due Date</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              {editable && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={editable ? 6 : 5} className="text-center text-muted-foreground py-8">
                  No action items
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editingId === item.id && editable ? (
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { description: e.target.value })
                        }
                        className="h-8"
                        placeholder="Action item description"
                      />
                    ) : (
                      item.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id && editable ? (
                      <Input
                        value={item.owner}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { owner: e.target.value })
                        }
                        className="h-8 text-xs"
                        placeholder="Owner"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">{item.owner || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id && editable ? (
                      <Input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { dueDate: e.target.value })
                        }
                        className="h-8 text-xs"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm font-mono">
                        {item.dueDate || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id && editable ? (
                      <Select
                        value={item.priority}
                        onValueChange={(v) =>
                          handleUpdateItem(item.id, { priority: v as ActionItemPriority })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn('text-xs', PRIORITY_CONFIG[item.priority].color)}
                      >
                        {PRIORITY_CONFIG[item.priority].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id && editable ? (
                      <Select
                        value={item.status}
                        onValueChange={(v) =>
                          handleUpdateItem(item.id, { status: v as ActionItemStatus })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn('text-xs', STATUS_CONFIG[item.status].color)}
                      >
                        {STATUS_CONFIG[item.status].label}
                      </Badge>
                    )}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {editingId === item.id ? (
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
                            onClick={() => setEditingId(item.id)}
                            className="h-7 px-2"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
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
        <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Action Item
        </Button>
      )}
    </div>
  )
}
