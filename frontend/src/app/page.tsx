"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/services/api"

export default function HomePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    incidentDate: "",
    severity: "",
    slackThread: "",
    logs: "",
    notes: "",
  })

  const pollGenerationStatus = async (taskId: string, postmortemId: string) => {
    try {
      const status = await api.getGenerationStatus(taskId)
      setProgress(status.progress)
      setGenerationStatus(status.currentStep || "Processing...")

      if (status.status === "completed") {
        router.push(`/postmortem/${postmortemId}`)
      } else if (status.status === "failed") {
        setError(status.error || "Generation failed")
        setIsGenerating(false)
      } else {
        // Continue polling
        setTimeout(() => pollGenerationStatus(taskId, postmortemId), 1000)
      }
    } catch (err) {
      setError("Failed to check generation status")
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setGenerationStatus("Starting generation...")

    try {
      const response = await api.createPostmortem({
        title: formData.title,
        severity: formData.severity || "SEV3",
        incidentDate: formData.incidentDate,
        slackThread: formData.slackThread,
        logs: formData.logs,
        notes: formData.notes,
      })

      // Start polling for status
      pollGenerationStatus(response.taskId, response.postmortemId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create postmortem")
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">&gt; New Postmortem</h1>
        <p className="text-muted-foreground">
          Enter incident details and let AI generate a comprehensive postmortem document.
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-500 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {isGenerating && (
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-primary font-medium">Generating Postmortem</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{generationStatus}</p>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title</Label>
              <Input
                id="title"
                placeholder="e.g., Database connection pool exhaustion"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEV1">SEV1 - Critical</SelectItem>
                <SelectItem value="SEV2">SEV2 - High</SelectItem>
                <SelectItem value="SEV3">SEV3 - Medium</SelectItem>
                <SelectItem value="SEV4">SEV4 - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Incident Data</h2>

          <div className="space-y-2">
            <Label htmlFor="slackThread">Slack Thread / Communication Log</Label>
            <Textarea
              id="slackThread"
              placeholder="Paste relevant Slack messages, communication logs, or incident channel transcript..."
              value={formData.slackThread}
              onChange={(e) => setFormData({ ...formData, slackThread: e.target.value })}
              rows={6}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logs">System Logs / Error Messages</Label>
            <Textarea
              id="logs"
              placeholder="Paste relevant error logs, stack traces, or monitoring alerts..."
              value={formData.logs}
              onChange={(e) => setFormData({ ...formData, logs: e.target.value })}
              rows={6}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context, observations, or notes about the incident..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              disabled={isGenerating}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isGenerating || !formData.title || !formData.incidentDate}>
            {isGenerating ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              "Generate Postmortem"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
