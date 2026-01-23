import { mockPostmortems } from '@/mocks/data/postmortems'
import { GENERATION_STEPS } from '@/types/generation'
import { delay, generateId } from '@/lib/utils'
import type {
  Postmortem,
  PostmortemCreateRequest,
  PostmortemUpdateRequest,
  PostmortemSection,
  PaginatedResponse,
  CreatePostmortemResponse,
  GenerationStatus,
  ExportResponse,
  ExportFormat,
} from '@/types'

const MOCK_DELAY = 300

interface GenerationTask {
  postmortemId: string
  status: GenerationStatus
  stepIndex: number
}

class MockApiService {
  private postmortems: Postmortem[] = [...mockPostmortems]
  private generationTasks: Map<string, GenerationTask> = new Map()

  // Postmortems
  async getPostmortems(params: {
    page?: number
    limit?: number
    severity?: string
    search?: string
  }): Promise<PaginatedResponse<Postmortem>> {
    await delay(MOCK_DELAY)

    let filtered = [...this.postmortems]

    if (params.severity) {
      filtered = filtered.filter(p => p.severity === params.severity)
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.summary?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime())

    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const items = filtered.slice(start, start + limit)

    return {
      items,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
    }
  }

  async getPostmortem(id: string): Promise<Postmortem> {
    await delay(MOCK_DELAY)

    const postmortem = this.postmortems.find(p => p.id === id)
    if (!postmortem) {
      throw new Error('Postmortem not found')
    }
    return { ...postmortem }
  }

  async createPostmortem(data: PostmortemCreateRequest): Promise<CreatePostmortemResponse> {
    await delay(MOCK_DELAY)

    const postmortemId = `pm-${generateId()}`
    const taskId = `task-${generateId()}`

    // Create initial postmortem in draft state
    const newPostmortem: Postmortem = {
      id: postmortemId,
      title: data.title,
      severity: data.severity,
      incidentDate: data.incidentDate,
      status: 'generating',
      slackThread: data.slackThread,
      logs: data.logs,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.postmortems.unshift(newPostmortem)

    // Initialize generation task
    this.generationTasks.set(taskId, {
      postmortemId,
      status: { status: 'pending', progress: 0 },
      stepIndex: 0,
    })

    // Start simulated generation
    this.simulateGeneration(taskId, postmortemId)

    return { taskId, postmortemId }
  }

  async updatePostmortem(id: string, data: PostmortemUpdateRequest): Promise<Postmortem> {
    await delay(MOCK_DELAY)

    const index = this.postmortems.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Postmortem not found')
    }

    this.postmortems[index] = {
      ...this.postmortems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return { ...this.postmortems[index] }
  }

  async deletePostmortem(id: string): Promise<void> {
    await delay(MOCK_DELAY)

    const index = this.postmortems.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Postmortem not found')
    }

    this.postmortems.splice(index, 1)
  }

  // Generation
  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    await delay(100)

    const task = this.generationTasks.get(taskId)
    if (!task) {
      return { status: 'failed', progress: 0, error: 'Task not found' }
    }

    return { ...task.status }
  }

  private async simulateGeneration(taskId: string, postmortemId: string) {
    const task = this.generationTasks.get(taskId)
    if (!task) return

    const totalSteps = GENERATION_STEPS.length

    for (let i = 0; i < totalSteps; i++) {
      const step = GENERATION_STEPS[i]
      const progress = Math.round(((i + 1) / totalSteps) * 100)

      task.stepIndex = i
      task.status = {
        status: i < totalSteps - 1 ? 'processing' : 'completed',
        progress,
        currentStep: step.message,
      }

      this.generationTasks.set(taskId, task)

      // Simulate processing time
      await delay(800 + Math.random() * 400)
    }

    // Update postmortem with generated content (use first mock as template)
    const template = mockPostmortems[0]
    const postmortem = this.postmortems.find(p => p.id === postmortemId)

    if (postmortem) {
      postmortem.status = 'completed'
      postmortem.summary = template.summary
      postmortem.timeline = template.timeline?.map(t => ({ ...t, id: generateId() }))
      postmortem.impact = template.impact
      postmortem.rootCause = template.rootCause
      postmortem.whys = template.whys?.map(w => ({ ...w, id: generateId() }))
      postmortem.wentWell = template.wentWell
      postmortem.wentPoorly = template.wentPoorly
      postmortem.actionItems = template.actionItems?.map(a => ({ ...a, id: generateId() }))
      postmortem.duration = '45 minutes'
      postmortem.updatedAt = new Date().toISOString()
    }
  }

  async regenerateSection(postmortemId: string, section: PostmortemSection): Promise<{ taskId: string }> {
    await delay(MOCK_DELAY)

    const taskId = `task-${generateId()}`

    // Simulate section regeneration
    setTimeout(async () => {
      await delay(2000)
      // In real implementation, this would update the specific section
    }, 0)

    return { taskId }
  }

  // Export
  async exportPostmortem(id: string, format: ExportFormat): Promise<ExportResponse> {
    await delay(MOCK_DELAY)

    const postmortem = this.postmortems.find(p => p.id === id)
    if (!postmortem) {
      throw new Error('Postmortem not found')
    }

    let content: string

    switch (format) {
      case 'markdown':
        content = this.generateMarkdown(postmortem)
        break
      case 'google-docs':
        content = this.generateGoogleDocsFormat(postmortem)
        break
      case 'confluence':
        content = this.generateConfluenceFormat(postmortem)
        break
      default:
        content = this.generateMarkdown(postmortem)
    }

    return {
      content,
      filename: `postmortem-${postmortem.incidentDate}-${postmortem.id}.${format === 'markdown' ? 'md' : 'txt'}`,
      format,
    }
  }

  private generateMarkdown(pm: Postmortem): string {
    return `# Postmortem: ${pm.title}

**Severity:** ${pm.severity}
**Date:** ${pm.incidentDate}
**Duration:** ${pm.duration || 'N/A'}

## Summary

${pm.summary || 'No summary available.'}

## Timeline

| Time | Event | Source |
|------|-------|--------|
${pm.timeline?.map(t => `| ${new Date(t.timestamp).toLocaleTimeString()} | ${t.description} | ${t.source || '-'} |`).join('\n') || '| - | No timeline events | - |'}

## Impact

${pm.impact || 'No impact assessment available.'}

## Root Cause

${pm.rootCause || 'No root cause identified.'}

## 5 Whys Analysis

${pm.whys?.map((w, i) => `${i + 1}. **${w.why}**\n   ${w.answer}`).join('\n\n') || 'No analysis available.'}

## What Went Well

${pm.wentWell?.map(w => `- ${w}`).join('\n') || '- No items listed'}

## What Went Poorly

${pm.wentPoorly?.map(w => `- ${w}`).join('\n') || '- No items listed'}

## Action Items

| Item | Owner | Due Date | Priority | Status |
|------|-------|----------|----------|--------|
${pm.actionItems?.map(a => `| ${a.description} | ${a.owner} | ${a.dueDate} | ${a.priority} | ${a.status} |`).join('\n') || '| - | - | - | - | - |'}

---
*Generated by Postmortem Writer*
`
  }

  private generateGoogleDocsFormat(pm: Postmortem): string {
    return `POSTMORTEM: ${pm.title.toUpperCase()}

Severity: ${pm.severity}
Date: ${pm.incidentDate}
Duration: ${pm.duration || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY

${pm.summary || 'No summary available.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMELINE

${pm.timeline?.map(t => `• ${new Date(t.timestamp).toLocaleTimeString()} - ${t.description}`).join('\n') || '• No timeline events'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPACT

${pm.impact || 'No impact assessment available.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROOT CAUSE

${pm.rootCause || 'No root cause identified.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 WHYS ANALYSIS

${pm.whys?.map((w, i) => `${i + 1}. ${w.why}\n   → ${w.answer}`).join('\n\n') || 'No analysis available.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT WENT WELL

${pm.wentWell?.map(w => `✓ ${w}`).join('\n') || '• No items listed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT WENT POORLY

${pm.wentPoorly?.map(w => `✗ ${w}`).join('\n') || '• No items listed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION ITEMS

${pm.actionItems?.map(a => `□ ${a.description}\n  Owner: ${a.owner} | Due: ${a.dueDate} | Priority: ${a.priority}`).join('\n\n') || '• No action items'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Postmortem Writer
`
  }

  private generateConfluenceFormat(pm: Postmortem): string {
    return `h1. Postmortem: ${pm.title}

{info}
*Severity:* ${pm.severity}
*Date:* ${pm.incidentDate}
*Duration:* ${pm.duration || 'N/A'}
{info}

h2. Summary

${pm.summary || 'No summary available.'}

h2. Timeline

||Time||Event||Source||
${pm.timeline?.map(t => `|${new Date(t.timestamp).toLocaleTimeString()}|${t.description}|${t.source || '-'}|`).join('\n') || '| - | No timeline events | - |'}

h2. Impact

${pm.impact || 'No impact assessment available.'}

h2. Root Cause

${pm.rootCause || 'No root cause identified.'}

h2. 5 Whys Analysis

${pm.whys?.map((w, i) => `# *${w.why}*\n** ${w.answer}`).join('\n') || 'No analysis available.'}

h2. What Went Well

${pm.wentWell?.map(w => `* (/) ${w}`).join('\n') || '* No items listed'}

h2. What Went Poorly

${pm.wentPoorly?.map(w => `* (x) ${w}`).join('\n') || '* No items listed'}

h2. Action Items

||Item||Owner||Due Date||Priority||Status||
${pm.actionItems?.map(a => `|${a.description}|${a.owner}|${a.dueDate}|${a.priority}|${a.status}|`).join('\n') || '| - | - | - | - | - |'}

----
_Generated by Postmortem Writer_
`
  }
}

export const mockApi = new MockApiService()
