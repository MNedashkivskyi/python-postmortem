'use client'

import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { formatDate } from '@/lib/utils'
import type { Postmortem } from '@/types'

interface HistoryItemProps {
  postmortem: Postmortem
}

export function HistoryItem({ postmortem }: HistoryItemProps) {
  return (
    <Link href={`/postmortem/${postmortem.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-glow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={postmortem.severity} />
                <span className="text-muted-foreground text-sm">
                  {formatDate(postmortem.incidentDate)}
                </span>
                {postmortem.duration && (
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {postmortem.duration}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground truncate">
                {postmortem.title}
              </h3>
              {postmortem.summary && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {postmortem.summary}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
