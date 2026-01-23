'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HistoryItem } from './history-item'
import { HistoryFilters } from './history-filters'
import { api } from '@/services/api'
import type { Postmortem, PaginatedResponse } from '@/types'
import Link from 'next/link'

export function HistoryList() {
  const [postmortems, setPostmortems] = useState<Postmortem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPostmortems = async () => {
      setIsLoading(true)
      try {
        const data = await api.getPostmortems({
          page,
          limit: 10,
          search: search || undefined,
          severity: severity || undefined,
        })
        setPostmortems(data.items)
        setTotalPages(data.pages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load postmortems')
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(fetchPostmortems, 300)
    return () => clearTimeout(timeoutId)
  }, [page, search, severity])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, severity])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <HistoryFilters
        search={search}
        onSearchChange={setSearch}
        severity={severity}
        onSeverityChange={setSeverity}
      />

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : postmortems.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search || severity ? 'No postmortems found' : 'No postmortems yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || severity
              ? 'Try adjusting your filters'
              : 'Create your first postmortem to get started'}
          </p>
          {!search && !severity && (
            <Link href="/">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Postmortem
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {postmortems.map((postmortem) => (
            <HistoryItem key={postmortem.id} postmortem={postmortem} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
