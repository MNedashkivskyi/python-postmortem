'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ListSectionProps {
  items: string[]
  onItemsChange?: (items: string[]) => void
  editable?: boolean
  emptyMessage?: string
  bulletStyle?: 'check' | 'cross' | 'bullet'
}

export function ListSection({
  items,
  onItemsChange,
  editable,
  emptyMessage = 'No items listed.',
  bulletStyle = 'bullet',
}: ListSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const getBullet = () => {
    switch (bulletStyle) {
      case 'check':
        return <span className="text-primary">+</span>
      case 'cross':
        return <span className="text-destructive">-</span>
      default:
        return <span className="text-muted-foreground">*</span>
    }
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(items[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newItems = [...items]
      newItems[editingIndex] = editValue.trim()
      onItemsChange?.(newItems)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleAddItem = () => {
    onItemsChange?.([...items, ''])
    setEditingIndex(items.length)
    setEditValue('')
  }

  const handleDeleteItem = (index: number) => {
    onItemsChange?.(items.filter((_, i) => i !== index))
  }

  if (items.length === 0 && !editable) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3 group">
          <span className="mt-0.5 font-mono">{getBullet()}</span>

          {editingIndex === index && editable ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveEdit}
                className="h-8 px-2 text-primary"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="flex-1">{item}</span>
              {editable && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(index)}
                    className="h-6 px-2"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(index)}
                    className="h-6 px-2 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {editable && (
        <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2 mt-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  )
}
