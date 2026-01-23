import type { Postmortem } from '@/types'

export const mockPostmortems: Postmortem[] = [
  {
    id: 'pm-001',
    title: 'Database Connection Pool Exhaustion',
    severity: 'SEV1',
    incidentDate: '2024-01-15',
    status: 'completed',
    duration: '47 minutes',

    slackThread: `[2024-01-15 03:42 UTC] @oncall-primary: Getting alerts for high latency on checkout API
[2024-01-15 03:45 UTC] @oncall-primary: Confirming - seeing 50% of requests timing out
[2024-01-15 03:48 UTC] @db-team: Database connection pool at 100% utilization
[2024-01-15 03:52 UTC] @oncall-primary: Escalating to SEV1 - customer impact confirmed
[2024-01-15 04:05 UTC] @db-team: Increasing connection pool from 50 to 200
[2024-01-15 04:15 UTC] @oncall-primary: Seeing improvement, error rate dropping
[2024-01-15 04:29 UTC] @oncall-primary: All clear - services recovered`,

    logs: `2024-01-15T03:42:15.234Z ERROR [checkout-api] Connection pool exhausted, waiting for available connection
2024-01-15T03:42:15.456Z WARN [checkout-api] Request timeout after 30s for order #12345
2024-01-15T03:42:16.123Z ERROR [checkout-api] Connection pool exhausted, waiting for available connection
2024-01-15T03:42:18.789Z ERROR [payment-service] Upstream timeout from checkout-api
2024-01-15T03:48:00.000Z INFO [db-monitor] Connection pool utilization: 50/50 (100%)
2024-01-15T04:05:30.000Z INFO [db-config] Connection pool size updated: 50 -> 200
2024-01-15T04:29:00.000Z INFO [checkout-api] All health checks passing`,

    notes: 'Traffic spike due to flash sale that was not communicated to engineering team. Marketing launched campaign at 3:30 AM UTC without prior notice.',

    summary: 'On January 15, 2024, the checkout service experienced a critical outage lasting 47 minutes due to database connection pool exhaustion triggered by unexpected traffic from an unannounced flash sale. The incident affected approximately 15,000 customers attempting to complete purchases, resulting in an estimated $450,000 in lost revenue.',

    timeline: [
      { id: 'te-001', timestamp: '2024-01-15T03:42:00Z', description: 'First latency alerts triggered in PagerDuty', eventType: 'detection', source: 'PagerDuty' },
      { id: 'te-002', timestamp: '2024-01-15T03:45:00Z', description: 'On-call engineer acknowledged and began investigation', eventType: 'response', source: 'Slack' },
      { id: 'te-003', timestamp: '2024-01-15T03:48:00Z', description: 'Root cause identified: connection pool at 100% utilization', eventType: 'event', source: 'Datadog' },
      { id: 'te-004', timestamp: '2024-01-15T03:52:00Z', description: 'Incident escalated to SEV1', eventType: 'event', source: 'Slack' },
      { id: 'te-005', timestamp: '2024-01-15T04:05:00Z', description: 'Connection pool size increased from 50 to 200', eventType: 'mitigation', source: 'AWS Console' },
      { id: 'te-006', timestamp: '2024-01-15T04:29:00Z', description: 'All services recovered, error rates returned to normal', eventType: 'resolution', source: 'Datadog' },
    ],

    impact: 'Customer-facing checkout was unavailable for 47 minutes during peak shopping hours (3:42 AM - 4:29 AM UTC). Approximately 15,000 unique users encountered errors. Estimated revenue loss: $450,000. Brand reputation impact from 127 social media complaints.',

    rootCause: 'The primary root cause was insufficient database connection pool capacity (configured at 50 connections) combined with lack of advance notice for a marketing flash sale that drove 3x normal traffic volume.',

    whys: [
      { id: 'w1', why: 'Why did the checkout service fail?', answer: 'Database connection pool was exhausted - all 50 connections were in use' },
      { id: 'w2', why: 'Why was the connection pool exhausted?', answer: 'Traffic exceeded the configured maximum connections by 3x' },
      { id: 'w3', why: 'Why did traffic exceed capacity?', answer: 'An unannounced flash sale drove 3x normal load at 3:30 AM' },
      { id: 'w4', why: 'Why was the flash sale unannounced to engineering?', answer: 'Marketing did not have a process to notify engineering of campaigns' },
      { id: 'w5', why: 'Why is there no notification process?', answer: 'Cross-team communication procedures were never formalized after company growth' },
    ],

    wentWell: [
      'Alerting triggered within 2 minutes of issue onset',
      'On-call response time was under 3 minutes',
      'Root cause was identified quickly (6 minutes)',
      'Mitigation was executed smoothly without additional issues',
      'Clear communication in incident channel',
    ],

    wentPoorly: [
      'No advance warning of marketing campaign',
      'Connection pool limits were too conservative for traffic spikes',
      'No auto-scaling configuration for database connections',
      'Runbook was outdated and missing this specific scenario',
      'No load testing done for 3x traffic scenarios',
    ],

    actionItems: [
      { id: 'ai-001', description: 'Implement cross-team notification process for marketing campaigns', owner: 'Marketing Lead', dueDate: '2024-02-01', priority: 'high', status: 'in_progress' },
      { id: 'ai-002', description: 'Increase default connection pool size and implement auto-scaling', owner: 'Platform Team', dueDate: '2024-01-22', priority: 'high', status: 'completed' },
      { id: 'ai-003', description: 'Update runbook with connection pool troubleshooting steps', owner: 'SRE Team', dueDate: '2024-01-25', priority: 'medium', status: 'open' },
      { id: 'ai-004', description: 'Add connection pool metrics to main operational dashboard', owner: 'Observability Team', dueDate: '2024-01-29', priority: 'medium', status: 'open' },
      { id: 'ai-005', description: 'Conduct load testing for 5x normal traffic scenarios', owner: 'QA Team', dueDate: '2024-02-15', priority: 'medium', status: 'open' },
    ],

    createdAt: '2024-01-15T05:30:00Z',
    updatedAt: '2024-01-16T10:15:00Z',
  },
  {
    id: 'pm-002',
    title: 'API Rate Limiting Misconfiguration',
    severity: 'SEV2',
    incidentDate: '2024-01-20',
    status: 'completed',
    duration: '2 hours 15 minutes',

    slackThread: `[2024-01-20 14:00 UTC] @api-alerts: Rate limit errors spiking on partner API
[2024-01-20 14:05 UTC] @backend-oncall: Investigating - seeing 429 responses
[2024-01-20 14:15 UTC] @backend-oncall: Found it - rate limit config was overwritten during deploy
[2024-01-20 14:30 UTC] @backend-oncall: Rolling back configuration
[2024-01-20 16:15 UTC] @backend-oncall: Rollback complete, monitoring`,

    logs: `2024-01-20T14:00:05.123Z WARN [api-gateway] Rate limit exceeded for partner_api_key_xyz
2024-01-20T14:00:05.234Z ERROR [rate-limiter] Config mismatch: expected 1000 req/min, got 100 req/min
2024-01-20T14:15:00.000Z INFO [deploy-log] Configuration rollback initiated
2024-01-20T16:15:00.000Z INFO [api-gateway] Rate limits restored to expected values`,

    notes: 'Configuration management issue - terraform state drift caused rate limits to be reset to defaults during routine deployment.',

    summary: 'On January 20, 2024, partner API integrations experienced degraded service for 2 hours and 15 minutes due to rate limiting misconfiguration deployed during a routine infrastructure update. 12 partner integrations were affected, causing temporary service disruptions for their end users.',

    timeline: [
      { id: 'te-101', timestamp: '2024-01-20T14:00:00Z', description: 'Rate limit alerts triggered for partner API', eventType: 'detection', source: 'Datadog' },
      { id: 'te-102', timestamp: '2024-01-20T14:05:00Z', description: 'On-call engineer began investigation', eventType: 'response', source: 'Slack' },
      { id: 'te-103', timestamp: '2024-01-20T14:15:00Z', description: 'Root cause identified: config overwritten during deploy', eventType: 'event', source: 'Terraform logs' },
      { id: 'te-104', timestamp: '2024-01-20T14:30:00Z', description: 'Configuration rollback initiated', eventType: 'mitigation', source: 'Terraform' },
      { id: 'te-105', timestamp: '2024-01-20T16:15:00Z', description: 'Rollback complete, all rate limits restored', eventType: 'resolution', source: 'Datadog' },
    ],

    impact: 'Partner API rate limits were reduced from 1000 req/min to 100 req/min. 12 partner integrations experienced 429 errors. Estimated 50,000 failed API calls during the incident window.',

    rootCause: 'Terraform state drift caused the rate limiting configuration to be reset to default values (100 req/min) during a routine infrastructure deployment. The drift occurred because manual changes had been made to production that were not reflected in the Terraform state.',

    whys: [
      { id: 'w101', why: 'Why were partners rate limited incorrectly?', answer: 'Rate limit configuration was set to 100 req/min instead of 1000 req/min' },
      { id: 'w102', why: 'Why was the configuration wrong?', answer: 'Terraform apply overwrote the production values with state defaults' },
      { id: 'w103', why: 'Why did Terraform have wrong values?', answer: 'State drift - manual production changes were not synced to Terraform' },
      { id: 'w104', why: 'Why were manual changes made without updating Terraform?', answer: 'Emergency fix 2 weeks ago bypassed normal change process' },
      { id: 'w105', why: 'Why was there no drift detection?', answer: 'Drift detection was not configured in CI/CD pipeline' },
    ],

    wentWell: [
      'Alerts triggered quickly after rate limit errors began',
      'Root cause identification was fast (15 minutes)',
      'Partner communication was proactive',
      'Rollback procedure worked as expected',
    ],

    wentPoorly: [
      'Terraform state drift went undetected for 2 weeks',
      'No pre-deployment validation of rate limit configs',
      'Manual changes were not documented or synced',
      'Rollback took longer than expected due to Terraform plan review',
    ],

    actionItems: [
      { id: 'ai-101', description: 'Implement Terraform drift detection in CI/CD', owner: 'DevOps Team', dueDate: '2024-02-05', priority: 'high', status: 'open' },
      { id: 'ai-102', description: 'Add rate limit config validation to deployment pipeline', owner: 'Platform Team', dueDate: '2024-02-10', priority: 'high', status: 'open' },
      { id: 'ai-103', description: 'Document emergency change process with state sync requirements', owner: 'SRE Team', dueDate: '2024-01-30', priority: 'medium', status: 'in_progress' },
    ],

    createdAt: '2024-01-20T17:00:00Z',
    updatedAt: '2024-01-21T09:30:00Z',
  },
  {
    id: 'pm-003',
    title: 'DNS Propagation Delay',
    severity: 'SEV3',
    incidentDate: '2024-01-25',
    status: 'completed',
    duration: '45 minutes',

    slackThread: `[2024-01-25 09:00 UTC] @support: Some users reporting site unreachable
[2024-01-25 09:10 UTC] @infra-oncall: Checking DNS - seeing some resolution failures
[2024-01-25 09:15 UTC] @infra-oncall: TTL was set too high during migration
[2024-01-25 09:30 UTC] @infra-oncall: Lowered TTL, waiting for propagation
[2024-01-25 09:45 UTC] @infra-oncall: All clear - DNS propagated`,

    logs: `2024-01-25T09:00:15.000Z WARN [dns-monitor] Resolution failures detected for api.example.com
2024-01-25T09:15:00.000Z INFO [dns-config] TTL updated: 86400 -> 300
2024-01-25T09:45:00.000Z INFO [dns-monitor] All DNS checks passing`,

    notes: 'DNS TTL was accidentally left at 24 hours after a previous migration. Should have been reduced to 5 minutes before the change.',

    summary: 'On January 25, 2024, approximately 5% of users experienced intermittent connectivity issues for 45 minutes due to DNS propagation delays following a routine DNS record update. The issue was caused by an excessively long TTL (24 hours) that should have been reduced prior to the change.',

    timeline: [
      { id: 'te-201', timestamp: '2024-01-25T09:00:00Z', description: 'Support tickets received about unreachable site', eventType: 'detection', source: 'Zendesk' },
      { id: 'te-202', timestamp: '2024-01-25T09:10:00Z', description: 'Infrastructure team began DNS investigation', eventType: 'response', source: 'Slack' },
      { id: 'te-203', timestamp: '2024-01-25T09:15:00Z', description: 'Identified high TTL as root cause', eventType: 'event', source: 'Route53' },
      { id: 'te-204', timestamp: '2024-01-25T09:30:00Z', description: 'TTL reduced from 24h to 5min', eventType: 'mitigation', source: 'Route53' },
      { id: 'te-205', timestamp: '2024-01-25T09:45:00Z', description: 'DNS fully propagated, all users able to connect', eventType: 'resolution', source: 'DNS Monitor' },
    ],

    impact: 'Approximately 5% of users (estimated 2,000 users) experienced intermittent connectivity issues. No data loss or security impact. Minor customer support ticket volume increase.',

    rootCause: 'DNS TTL was left at 24 hours (86400 seconds) from a previous migration instead of being reduced to 5 minutes (300 seconds) before making DNS changes. This caused some users to cache the old DNS records for an extended period.',

    whys: [
      { id: 'w201', why: 'Why did some users experience connectivity issues?', answer: 'Their DNS resolvers had cached the old IP address' },
      { id: 'w202', why: 'Why were old records cached for so long?', answer: 'TTL was set to 24 hours instead of 5 minutes' },
      { id: 'w203', why: 'Why was TTL set to 24 hours?', answer: 'It was not reduced prior to the DNS change as per standard procedure' },
      { id: 'w204', why: 'Why was the procedure not followed?', answer: 'The pre-change checklist was not consulted' },
    ],

    wentWell: [
      'Issue was detected through support channels quickly',
      'Root cause was identified within 15 minutes',
      'Fix was straightforward and low-risk',
      'Impact was limited to small percentage of users',
    ],

    wentPoorly: [
      'Pre-change checklist was not followed',
      'No automated TTL validation before DNS changes',
      'Detection relied on user reports rather than monitoring',
    ],

    actionItems: [
      { id: 'ai-201', description: 'Add automated TTL check to DNS change workflow', owner: 'Infrastructure Team', dueDate: '2024-02-01', priority: 'medium', status: 'open' },
      { id: 'ai-202', description: 'Implement proactive DNS propagation monitoring', owner: 'SRE Team', dueDate: '2024-02-15', priority: 'low', status: 'open' },
    ],

    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-25T14:00:00Z',
  },
]
