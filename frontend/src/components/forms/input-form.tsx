'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Send, FileText, Terminal, StickyNote, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/shared/date-picker'
import { SEVERITY_CONFIG, type Severity, type PostmortemCreateRequest } from '@/types'

interface InputFormProps {
  onSubmit: (data: PostmortemCreateRequest) => void
  isLoading?: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<Severity>('SEV2')
  const [incidentDate, setIncidentDate] = useState<Date>(new Date())
  const [slackThread, setSlackThread] = useState('')
  const [logs, setLogs] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slackThread.trim()) {
      return
    }

    onSubmit({
      title: title.trim(),
      severity,
      incidentDate: format(incidentDate, 'yyyy-MM-dd'),
      slackThread: slackThread.trim(),
      logs: logs.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Metadata Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Incident Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Database Connection Pool Exhaustion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Incident Date *</Label>
              <DatePicker
                date={incidentDate}
                onDateChange={(date) => date && setIncidentDate(date)}
                placeholder="Select incident date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slack Thread Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Slack Thread *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste the Slack incident thread here...

Example:
[2024-01-15 03:42 UTC] @oncall-primary: Getting alerts for high latency on checkout API
[2024-01-15 03:45 UTC] @oncall-primary: Confirming - seeing 50% of requests timing out
[2024-01-15 03:48 UTC] @db-team: Database connection pool at 100% utilization
..."
            value={slackThread}
            onChange={(e) => setSlackThread(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            required
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Paste the raw Slack thread or export. Include timestamps and usernames for better timeline extraction.
          </p>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            System Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste relevant logs here (Grafana, Datadog, CloudWatch, etc.)...

Example:
2024-01-15T03:42:15.234Z ERROR [checkout-api] Connection pool exhausted
2024-01-15T03:42:15.456Z WARN [checkout-api] Request timeout after 30s
..."
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Include error logs, metrics, and any relevant system output. The more context, the better the analysis.
          </p>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional context, observations, or notes about the incident...

Example:
- Traffic spike due to unannounced flash sale
- Similar incident occurred 3 months ago
- On-call engineer was already handling another issue
..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Add any context that might not be captured in Slack or logs. This helps with root cause analysis.
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !title.trim() || !slackThread.trim()}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Postmortem'}
        </Button>
      </div>
    </form>
  )
}
