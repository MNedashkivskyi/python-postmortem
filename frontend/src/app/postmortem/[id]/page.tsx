"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPostmortemById } from "@/services/mock-data"
import { Postmortem } from "@/types/postmortem"
import { formatDate, formatDuration } from "@/lib/utils"

export default function PostmortemPage() {
  const params = useParams()
  const [postmortem, setPostmortem] = useState<Postmortem | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const data = getPostmortemById(id)
    if (data) {
      setPostmortem(data)
    }
  }, [params.id])

  const handleCopyToClipboard = () => {
    if (!postmortem) return

    const text = generatePlainText(postmortem)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!postmortem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading postmortem...</p>
      </div>
    )
  }

  const severityColor: Record<string, string> = {
    SEV1: "bg-red-500/20 text-red-400 border-red-500/50",
    SEV2: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    SEV3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    SEV4: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{postmortem.title}</h1>
            <Badge className={severityColor[postmortem.severity]}>{postmortem.severity}</Badge>
            <Badge variant="outline">{postmortem.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {formatDate(postmortem.incidentDate)} | Duration: {formatDuration(postmortem.duration)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            {copied ? "Copied!" : "Copy as Text"}
          </Button>
          <Button variant="outline">Edit</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-primary">Summary</h2>
            <p className="text-foreground">{postmortem.summary}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-primary">Impact</h2>
            <p className="text-foreground">{postmortem.impact}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-primary">Lessons Learned</h2>
            <ul className="list-disc list-inside space-y-2">
              {postmortem.lessonsLearned.map((lesson, index) => (
                <li key={index} className="text-foreground">{lesson}</li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-primary">Incident Timeline</h2>
            <div className="space-y-4">
              {postmortem.timeline.map((entry, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="text-sm text-muted-foreground whitespace-nowrap min-w-[140px]">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{entry.event}</p>
                    <p className="text-sm text-muted-foreground mt-1">— {entry.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-primary">Root Cause</h2>
            <p className="text-foreground">{postmortem.rootCause}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-primary">5 Whys Analysis</h2>
            <div className="space-y-4">
              {postmortem.whys.map((why, index) => (
                <div key={index} className="pl-4 border-l-2 border-primary">
                  <p className="font-medium text-foreground">{index + 1}. {why.question}</p>
                  <p className="text-muted-foreground mt-1">{why.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-primary">Action Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postmortem.actionItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.priority === "high" ? "border-red-500 text-red-400" :
                        item.priority === "medium" ? "border-yellow-500 text-yellow-400" :
                        "border-blue-500 text-blue-400"
                      }>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "completed" ? "default" : "outline"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.dueDate ? formatDate(item.dueDate) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generatePlainText(postmortem: Postmortem): string {
  const lines: string[] = []

  lines.push(`# ${postmortem.title}`)
  lines.push(``)
  lines.push(`**Severity:** ${postmortem.severity}`)
  lines.push(`**Date:** ${formatDate(postmortem.incidentDate)}`)
  lines.push(`**Duration:** ${formatDuration(postmortem.duration)}`)
  lines.push(`**Status:** ${postmortem.status}`)
  lines.push(``)
  lines.push(`## Summary`)
  lines.push(postmortem.summary || "N/A")
  lines.push(``)
  lines.push(`## Impact`)
  lines.push(postmortem.impact || "N/A")
  lines.push(``)
  lines.push(`## Timeline`)
  postmortem.timeline.forEach((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString()
    lines.push(`- ${time}: ${entry.event} (${entry.actor})`)
  })
  lines.push(``)
  lines.push(`## Root Cause`)
  lines.push(postmortem.rootCause || "N/A")
  lines.push(``)
  lines.push(`## 5 Whys Analysis`)
  postmortem.whys.forEach((why, index) => {
    lines.push(`${index + 1}. **${why.question}**`)
    lines.push(`   ${why.answer}`)
  })
  lines.push(``)
  lines.push(`## Action Items`)
  postmortem.actionItems.forEach((item) => {
    lines.push(`- [${item.status === "completed" ? "x" : " "}] ${item.description} (Owner: ${item.owner}, Priority: ${item.priority})`)
  })
  lines.push(``)
  lines.push(`## Lessons Learned`)
  postmortem.lessonsLearned.forEach((lesson) => {
    lines.push(`- ${lesson}`)
  })

  return lines.join("\n")
}
