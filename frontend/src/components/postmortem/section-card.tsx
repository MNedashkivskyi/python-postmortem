'use client'

import { useState } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  onRegenerate?: () => void
  isRegenerating?: boolean
  editable?: boolean
  editValue?: string
  onEditSave?: (value: string) => void
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function SectionCard({
  title,
  icon,
  children,
  onRegenerate,
  isRegenerating,
  editable,
  editValue,
  onEditSave,
  collapsible,
  defaultCollapsed = false,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(editValue || '')

  const handleEditSave = () => {
    onEditSave?.(editText)
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditText(editValue || '')
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {editable && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditText(editValue || '')
                  setIsEditing(true)
                }}
                className="h-8 px-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSave}
                  className="h-8 px-2 text-primary"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                  className="h-8 px-2 text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="h-8 gap-1"
              >
                <RefreshCw className={cn('h-3 w-3', isRegenerating && 'animate-spin')} />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 px-2"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[150px]"
              autoFocus
            />
          ) : (
            children
          )}
        </CardContent>
      )}
    </Card>
  )
}
