import { PageContainer } from '@/components/layout/page-container'
import { PostmortemView } from '@/components/postmortem/postmortem-view'

interface PageProps {
  params: { id: string }
}

export default function PostmortemPage({ params }: PageProps) {
  return (
    <PageContainer className="max-w-5xl">
      <PostmortemView postmortemId={params.id} />
    </PageContainer>
  )
}
