import { Badge } from '@/components/ui/badge'
import { SEVERITY_CONFIG, type Severity } from '@/types'

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <Badge variant={config.variant} className={className}>
      {severity}
    </Badge>
  )
}
