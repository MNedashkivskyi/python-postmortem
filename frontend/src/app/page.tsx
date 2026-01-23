'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { InputForm } from '@/components/forms/input-form'
import { GenerationProgress } from '@/components/generation/generation-progress'
import { api } from '@/services/api'
import type { PostmortemCreateRequest } from '@/types'

export default function InputPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [postmortemId, setPostmortemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: PostmortemCreateRequest) => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await api.createPostmortem(data)
      setTaskId(result.taskId)
      setPostmortemId(result.postmortemId)
    } catch (err) {
      setIsGenerating(false)
      setError(err instanceof Error ? err.message : 'Failed to create postmortem')
    }
  }

  const handleGenerationComplete = () => {
    if (postmortemId) {
      router.push(`/postmortem/${postmortemId}`)
    }
  }

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage)
    setIsGenerating(false)
    setTaskId(null)
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2 mb-2">
            <Terminal className="h-6 w-6" />
            <span className="text-primary">{'>'}</span> New Postmortem
          </h1>
          <p className="text-muted-foreground">
            Paste your incident data below to generate a comprehensive postmortem document.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Content */}
        {isGenerating && taskId ? (
          <GenerationProgress
            taskId={taskId}
            onComplete={handleGenerationComplete}
            onError={handleGenerationError}
          />
        ) : (
          <InputForm onSubmit={handleSubmit} isLoading={isGenerating} />
        )}
      </div>
    </PageContainer>
  )
}
