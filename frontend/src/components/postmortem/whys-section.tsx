'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { WhyItem } from '@/types'
import { generateId } from '@/lib/utils'

interface WhysSectionProps {
  whys: WhyItem[]
  onWhysChange?: (whys: WhyItem[]) => void
  editable?: boolean
}

export function WhysSection({ whys, onWhysChange, editable }: WhysSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWhy, setEditWhy] = useState('')
  const [editAnswer, setEditAnswer] = useState('')

  const handleStartEdit = (item: WhyItem) => {
    setEditingId(item.id)
    setEditWhy(item.why)
    setEditAnswer(item.answer)
  }

  const handleSaveEdit = (id: string) => {
    onWhysChange?.(
      whys.map(w =>
        w.id === id ? { ...w, why: editWhy, answer: editAnswer } : w
      )
    )
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditWhy('')
    setEditAnswer('')
  }

  const handleAddWhy = () => {
    const newWhy: WhyItem = {
      id: generateId(),
      why: 'Why?',
      answer: '',
    }
    onWhysChange?.([...whys, newWhy])
    handleStartEdit(newWhy)
  }

  const handleDeleteWhy = (id: string) => {
    onWhysChange?.(whys.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-4">
      {whys.length === 0 ? (
        <p className="text-muted-foreground text-sm">No analysis available.</p>
      ) : (
        <div className="space-y-4">
          {whys.map((item, index) => (
            <div
              key={item.id}
              className="relative pl-8 pb-4 border-l-2 border-border last:pb-0"
            >
              {/* Number indicator */}
              <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>

              {editingId === item.id && editable ? (
                <div className="space-y-3 ml-4">
                  <Input
                    value={editWhy}
                    onChange={(e) => setEditWhy(e.target.value)}
                    placeholder="Why...?"
                    className="font-medium"
                  />
                  <Textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    placeholder="Answer..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveEdit(item.id)}
                      className="text-primary"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="ml-4 group">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-foreground">{item.why}</p>
                    {editable && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          className="h-6 px-2"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWhy(item.id)}
                          className="h-6 px-2 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <Button variant="outline" size="sm" onClick={handleAddWhy} className="gap-2 ml-8">
          <Plus className="h-4 w-4" />
          Add Why
        </Button>
      )}
    </div>
  )
}
