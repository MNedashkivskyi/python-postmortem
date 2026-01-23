'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/services/api'
import type { ExportFormat } from '@/types'

interface ExportDropdownProps {
  postmortemId: string
}

export function ExportDropdown({ postmortemId }: ExportDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [exportContent, setExportContent] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setIsLoading(true)
    try {
      const result = await api.exportPostmortem(postmortemId, format)
      setExportContent(result.content)
      setExportFormat(format)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (exportContent) {
      await navigator.clipboard.writeText(exportContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (exportContent && exportFormat) {
      const blob = new Blob([exportContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `postmortem-${postmortemId}.${exportFormat === 'markdown' ? 'md' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'markdown':
        return 'Markdown'
      case 'google-docs':
        return 'Google Docs'
      case 'confluence':
        return 'Confluence'
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={isLoading}>
            <Download className="h-4 w-4" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('markdown')}>
            <FileText className="h-4 w-4 mr-2" />
            Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('google-docs')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Google Docs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('confluence')}>
            <FileText className="h-4 w-4 mr-2" />
            Confluence
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!exportContent} onOpenChange={() => setExportContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Export - {exportFormat && getFormatLabel(exportFormat)}
            </DialogTitle>
            <DialogDescription>
              Copy the content below or download the file.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] border border-border rounded-md">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
              {exportContent}
            </pre>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
