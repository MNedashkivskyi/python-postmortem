'use client'

import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/services/api'
import { GENERATION_STEPS } from '@/types/generation'
import type { GenerationStatus } from '@/types'
import { cn } from '@/lib/utils'

interface GenerationProgressProps {
  taskId: string
  onComplete: () => void
  onError?: (error: string) => void
}

interface TerminalLine {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error'
}

export function GenerationProgress({ taskId, onComplete, onError }: GenerationProgressProps) {
  const [status, setStatus] = useState<GenerationStatus>({ status: 'pending', progress: 0 })
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial terminal line
    addTerminalLine('[INIT] Starting postmortem generation...', 'info')

    const pollStatus = async () => {
      try {
        const newStatus = await api.getGenerationStatus(taskId)
        setStatus(newStatus)

        // Find current step index based on progress
        const stepIndex = Math.min(
          Math.floor((newStatus.progress / 100) * GENERATION_STEPS.length),
          GENERATION_STEPS.length - 1
        )

        // Add terminal line for new step
        if (stepIndex > currentStepIndex && stepIndex < GENERATION_STEPS.length) {
          const step = GENERATION_STEPS[stepIndex]
          addTerminalLine(step.message || step.label, 'info')
          setCurrentStepIndex(stepIndex)
        }

        if (newStatus.status === 'completed') {
          addTerminalLine('[SUCCESS] Postmortem generated successfully!', 'success')
          setTimeout(onComplete, 1000)
          return
        }

        if (newStatus.status === 'failed') {
          addTerminalLine(`[ERROR] ${newStatus.error || 'Generation failed'}`, 'error')
          onError?.(newStatus.error || 'Generation failed')
          return
        }

        // Continue polling
        setTimeout(pollStatus, 500)
      } catch (error) {
        addTerminalLine('[ERROR] Failed to check generation status', 'error')
        onError?.('Failed to check generation status')
      }
    }

    pollStatus()
  }, [taskId])

  const addTerminalLine = (message: string, type: TerminalLine['type']) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setTerminalLines(prev => [...prev, { timestamp, message, type }])
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [terminalLines])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Generating Postmortem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENERATION_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isActive = index === currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md text-xs',
                    isActive && 'bg-primary/10 border border-primary/30',
                    isCompleted && 'text-muted-foreground',
                    isPending && 'text-muted-foreground/50'
                  )}
                >
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  {isActive && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
                  {isPending && <Circle className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{step.label.replace('...', '')}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Terminal Output */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-primary">$</span>
            Terminal Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={scrollRef}
            className="bg-background border border-border rounded-md p-4 h-[300px] overflow-y-auto font-mono text-sm"
          >
            {terminalLines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-2',
                  line.type === 'success' && 'text-primary',
                  line.type === 'error' && 'text-destructive'
                )}
              >
                <span className="text-muted-foreground shrink-0">[{line.timestamp}]</span>
                <span className={line.type === 'info' ? 'terminal-typing' : ''}>
                  {line.message}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-primary">$</span>
              <span className="terminal-cursor inline-block w-2 h-4 bg-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
