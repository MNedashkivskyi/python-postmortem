'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SEVERITY_CONFIG, type Severity } from '@/types'

interface HistoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  severity: string
  onSeverityChange: (value: string) => void
}

export function HistoryFilters({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
}: HistoryFiltersProps) {
  const handleClearFilters = () => {
    onSearchChange('')
    onSeverityChange('')
  }

  const hasFilters = search || severity

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search postmortems..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Severity Filter */}
      <Select value={severity} onValueChange={onSeverityChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Severities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Severities</SelectItem>
          {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" onClick={handleClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
