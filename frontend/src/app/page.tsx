"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    incidentDate: "",
    severity: "",
    duration: "",
    slackThread: "",
    logs: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate generation - will be replaced with actual API call
    setTimeout(() => {
      window.location.href = "/postmortem/demo-1"
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">&gt; New Postmortem</h1>
        <p className="text-muted-foreground">
          Enter incident details and let AI generate a comprehensive postmortem document.
        </p>
      </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 45"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
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
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <span className="animate-pulse">Generating...</span>
              </>
            ) : (
              "Generate Postmortem"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
