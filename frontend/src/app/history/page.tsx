"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllPostmortems } from "@/services/mock-data"
import { formatDate, formatDuration } from "@/lib/utils"

export default function HistoryPage() {
  const [search, setSearch] = useState("")
  const postmortems = getAllPostmortems()

  const filteredPostmortems = postmortems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const severityColor: Record<string, string> = {
    SEV1: "bg-red-500/20 text-red-400 border-red-500/50",
    SEV2: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    SEV3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    SEV4: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  }

  const statusColor: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">&gt; Postmortem History</h1>
          <p className="text-muted-foreground">
            View and manage all generated postmortem documents.
          </p>
        </div>
        <Link href="/">
          <Button>New Postmortem</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search postmortems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPostmortems.map((postmortem) => (
              <TableRow key={postmortem.id}>
                <TableCell className="font-medium">
                  <Link href={`/postmortem/${postmortem.id}`} className="hover:text-primary">
                    {postmortem.title}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(postmortem.incidentDate)}</TableCell>
                <TableCell>
                  <Badge className={severityColor[postmortem.severity]}>
                    {postmortem.severity}
                  </Badge>
                </TableCell>
                <TableCell>{formatDuration(postmortem.duration)}</TableCell>
                <TableCell>
                  <Badge className={statusColor[postmortem.status]}>
                    {postmortem.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/postmortem/${postmortem.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPostmortems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No postmortems found matching your search.
          </div>
        )}
      </Card>
    </div>
  )
}
