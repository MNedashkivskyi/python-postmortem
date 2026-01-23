import { History } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { HistoryList } from '@/components/history/history-list'

export default function HistoryPage() {
  return (
    <PageContainer className="max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2 mb-2">
            <History className="h-6 w-6" />
            <span className="text-primary">{'>'}</span> Postmortem History
          </h1>
          <p className="text-muted-foreground">
            View and search your past incident postmortems.
          </p>
        </div>

        {/* History List */}
        <HistoryList />
      </div>
    </PageContainer>
  )
}
