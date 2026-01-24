import { Postmortem } from "@/types/postmortem"

export const mockPostmortems: Postmortem[] = [
  {
    id: "demo-1",
    title: "Database Connection Pool Exhaustion",
    incidentDate: "2024-01-15",
    severity: "SEV1",
    status: "completed",
    duration: 127,
    summary: "Production database connection pool was exhausted due to a connection leak in the user authentication service, causing widespread service degradation for approximately 2 hours.",
    impact: "Approximately 45,000 users were unable to log in or access their accounts. API error rates spiked to 78% during the incident window. Revenue impact estimated at $12,000 in lost transactions.",
    timeline: [
      { timestamp: "2024-01-15T14:23:00Z", event: "First alerts triggered - API response times exceeding 5s threshold", actor: "PagerDuty" },
      { timestamp: "2024-01-15T14:25:00Z", event: "On-call engineer acknowledged alert and began investigation", actor: "Sarah Chen" },
      { timestamp: "2024-01-15T14:32:00Z", event: "Identified database connection pool at 100% utilization", actor: "Sarah Chen" },
      { timestamp: "2024-01-15T14:45:00Z", event: "Escalated to SEV1, incident commander assigned", actor: "Mike Johnson" },
      { timestamp: "2024-01-15T15:10:00Z", event: "Root cause identified - connection leak in auth service v2.3.1", actor: "Alex Rivera" },
      { timestamp: "2024-01-15T15:35:00Z", event: "Rolled back auth service to v2.3.0", actor: "Sarah Chen" },
      { timestamp: "2024-01-15T15:50:00Z", event: "Connection pool utilization returning to normal", actor: "Monitoring" },
      { timestamp: "2024-01-15T16:30:00Z", event: "Incident resolved, all services operating normally", actor: "Mike Johnson" },
    ],
    rootCause: "A code change in auth-service v2.3.1 introduced a bug where database connections were not being properly released back to the pool after failed authentication attempts. Under normal load, this was not noticeable, but during a marketing campaign that increased login attempts by 300%, the leak accumulated rapidly.",
    whys: [
      { question: "Why did the connection pool get exhausted?", answer: "Database connections were not being returned to the pool after failed authentication attempts." },
      { question: "Why weren't connections being returned?", answer: "A try-catch block in the authentication handler was missing the finally clause that releases the connection." },
      { question: "Why was this code deployed to production?", answer: "The code review did not catch the missing connection release, and our test suite did not have a test for connection cleanup on auth failure." },
      { question: "Why didn't our test suite catch this?", answer: "Integration tests mock the database layer and don't use real connection pools." },
      { question: "Why do we mock the database in integration tests?", answer: "To speed up test execution, but this prevents us from catching connection management issues." },
    ],
    actionItems: [
      { id: "1", description: "Add integration tests that use real database connections for auth service", owner: "Alex Rivera", priority: "high", status: "in_progress", dueDate: "2024-01-22" },
      { id: "2", description: "Implement connection pool monitoring with alerts at 70% and 90% thresholds", owner: "Sarah Chen", priority: "high", status: "completed", dueDate: "2024-01-18" },
      { id: "3", description: "Add static analysis rule to detect missing connection release in finally blocks", owner: "DevOps Team", priority: "medium", status: "pending", dueDate: "2024-01-29" },
      { id: "4", description: "Document connection management best practices and add to onboarding", owner: "Mike Johnson", priority: "low", status: "pending", dueDate: "2024-02-05" },
    ],
    lessonsLearned: [
      "Connection pool exhaustion can happen gradually and may not trigger alerts until it's too late",
      "Mocking database connections in tests hides real resource management issues",
      "Marketing campaigns should trigger proactive scaling reviews",
    ],
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-17T14:30:00Z",
  },
  {
    id: "demo-2",
    title: "CDN Cache Invalidation Storm",
    incidentDate: "2024-01-10",
    severity: "SEV2",
    status: "completed",
    duration: 45,
    summary: "A misconfigured deployment triggered mass cache invalidation across all CDN edge nodes, causing origin server overload and degraded performance for static assets.",
    impact: "Page load times increased by 400% for 45 minutes. Approximately 200,000 users experienced slow loading images and stylesheets. No data loss occurred.",
    timeline: [
      { timestamp: "2024-01-10T09:15:00Z", event: "Deployment of frontend v4.2.0 initiated", actor: "CI/CD Pipeline" },
      { timestamp: "2024-01-10T09:17:00Z", event: "CDN cache purge triggered for all assets", actor: "Deployment Script" },
      { timestamp: "2024-01-10T09:18:00Z", event: "Origin server CPU spikes to 95%", actor: "Monitoring" },
      { timestamp: "2024-01-10T09:22:00Z", event: "Alert triggered for slow asset loading", actor: "Synthetic Monitoring" },
      { timestamp: "2024-01-10T09:30:00Z", event: "Identified cache invalidation as root cause", actor: "Tom Wilson" },
      { timestamp: "2024-01-10T09:45:00Z", event: "Scaled origin servers to handle load", actor: "Tom Wilson" },
      { timestamp: "2024-01-10T10:00:00Z", event: "CDN cache warmed, performance restored", actor: "CDN" },
    ],
    rootCause: "The deployment configuration was set to purge all CDN cache on every deployment instead of using versioned asset URLs. This caused all edge nodes to simultaneously request assets from origin.",
    whys: [
      { question: "Why did origin servers get overloaded?", answer: "All CDN edge nodes requested assets simultaneously after cache purge." },
      { question: "Why was cache purged globally?", answer: "Deployment script was configured to invalidate all cache paths." },
      { question: "Why was this configuration in place?", answer: "It was a quick fix from 6 months ago that was never properly addressed." },
    ],
    actionItems: [
      { id: "1", description: "Implement versioned asset URLs to eliminate need for cache purging", owner: "Frontend Team", priority: "high", status: "completed", dueDate: "2024-01-17" },
      { id: "2", description: "Add deployment safeguard to prevent full cache invalidation", owner: "DevOps Team", priority: "medium", status: "in_progress", dueDate: "2024-01-24" },
    ],
    lessonsLearned: [
      "Quick fixes need tracking and follow-up to prevent them from becoming permanent problems",
      "Cache invalidation strategies should be reviewed as part of deployment configuration",
    ],
    createdAt: "2024-01-11T08:00:00Z",
    updatedAt: "2024-01-12T16:00:00Z",
  },
  {
    id: "demo-3",
    title: "Payment Processing Timeout",
    incidentDate: "2024-01-08",
    severity: "SEV1",
    status: "draft",
    duration: 90,
    summary: "Payment gateway integration experienced timeouts due to SSL certificate expiration on internal proxy, blocking all payment processing.",
    impact: "Zero payments processed for 90 minutes. Estimated $50,000 in abandoned carts. Customer support received 500+ complaints.",
    timeline: [
      { timestamp: "2024-01-08T11:00:00Z", event: "First payment timeout reported", actor: "Customer Support" },
      { timestamp: "2024-01-08T11:05:00Z", event: "Multiple timeout alerts triggered", actor: "Payment Service" },
      { timestamp: "2024-01-08T11:15:00Z", event: "Incident declared, investigation started", actor: "On-call Team" },
      { timestamp: "2024-01-08T11:45:00Z", event: "Identified expired SSL cert on payment proxy", actor: "Network Team" },
      { timestamp: "2024-01-08T12:00:00Z", event: "New certificate deployed", actor: "Network Team" },
      { timestamp: "2024-01-08T12:30:00Z", event: "Payment processing restored", actor: "Payment Service" },
    ],
    rootCause: "SSL certificate on the internal payment proxy expired. Certificate renewal was not automated and the manual renewal process was not followed.",
    whys: [
      { question: "Why did payments fail?", answer: "SSL handshake failed between payment service and gateway proxy." },
      { question: "Why did SSL handshake fail?", answer: "Certificate on proxy had expired." },
      { question: "Why wasn't the certificate renewed?", answer: "Manual renewal process was missed; no automated alerts for expiring certs." },
    ],
    actionItems: [
      { id: "1", description: "Implement automated certificate renewal with Let's Encrypt", owner: "Security Team", priority: "high", status: "pending", dueDate: "2024-01-15" },
      { id: "2", description: "Add certificate expiry monitoring with 30-day advance warning", owner: "DevOps Team", priority: "high", status: "pending", dueDate: "2024-01-12" },
    ],
    lessonsLearned: [
      "Critical infrastructure certificates must have automated renewal",
      "Manual processes for recurring tasks are prone to human error",
    ],
    createdAt: "2024-01-08T14:00:00Z",
    updatedAt: "2024-01-08T14:00:00Z",
  },
]

export function getPostmortemById(id: string): Postmortem | undefined {
  return mockPostmortems.find((p) => p.id === id)
}

export function getAllPostmortems(): Postmortem[] {
  return mockPostmortems
}
