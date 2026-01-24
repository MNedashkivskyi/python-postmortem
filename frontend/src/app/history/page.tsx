"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/services/api"
import { Postmortem } from "@/types/postmortem"
import { formatDate } from "@/lib/utils"

type SortField = "date" | "severity" | null
type SortOrder = "asc" | "desc"

const severityOrder: Record<string, number> = {
  SEV1: 1,
  SEV2: 2,
  SEV3: 3,
  SEV4: 4,
}

export default function HistoryPage() {
  const [search, setSearch] = useState("")
  const [postmortems, setPostmortems] = useState<Postmortem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: "date" | "severity") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const SortIcon = ({ field }: { field: "date" | "severity" }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-muted-foreground/50">↕</span>
    }
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
  }

  useEffect(() => {
    const fetchPostmortems = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.listPostmortems(1, 50, search || undefined)
        setPostmortems(response.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load postmortems")
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(fetchPostmortems, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  const sortedPostmortems = useMemo(() => {
    return [...postmortems].sort((a, b) => {
      let comparison = 0

      if (sortField === "date") {
        comparison = new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime()
      } else if (sortField === "severity") {
        comparison = severityOrder[a.severity] - severityOrder[b.severity]
      }

      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [postmortems, sortField, sortOrder])

  const severityColor: Record<string, string> = {
    SEV1: "bg-red-500/20 text-red-400 border-red-500/50",
    SEV2: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    SEV3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    SEV4: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  }

  const statusColor: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    generating: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    failed: "bg-red-500/20 text-red-400 border-red-500/50",
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

      {error && (
        <Card className="p-4 mb-6 border-red-500 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search postmortems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading postmortems...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Date
                      <SortIcon field="date" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("severity")}
                      className="flex items-center hover:text-primary transition-colors"
                    >
                      Severity
                      <SortIcon field="severity" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPostmortems.map((postmortem) => (
                  <TableRow key={postmortem.id}>
                    <TableCell className="font-medium">
                      <Link href={`/postmortem/${postmortem.id}`} className="hover:text-primary">
                        {postmortem.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(postmortem.incidentDate)}</TableCell>
                    <TableCell>
                      <Badge className={severityColor[postmortem.severity] || ""}>
                        {postmortem.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor[postmortem.status] || ""}>
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

            {sortedPostmortems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {search ? "No postmortems found matching your search." : "No postmortems yet. Create your first one!"}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
