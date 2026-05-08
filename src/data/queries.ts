import rawData from './metrics.json'
import type { MetricsData, DatasetId, MetricKey } from './types'

const data = rawData as unknown as MetricsData

export function getMetadata(id: DatasetId) {
    return data[id].metadata.metrics
}

export function getRecentDays(id: DatasetId, n: number) {
    return data[id].days.slice(-n)
}

export function getTodayMetrics(id: DatasetId) {
    const days = data[id].days
    return days[days.length - 1]
}

export function getTrend(id: DatasetId, key: MetricKey, last: number): number | null {
    const days = getRecentDays(id, last)
    const values = days
        .map(d => d.metrics[key])
        .filter((v): v is number => v !== null)
    if (values.length === 0) return null
    return values.reduce((a, b) => a + b, 0) / values.length
}

export function getDelta(id: DatasetId, key: MetricKey): number | null {
    const recent = getTrend(id, key, 7)
    const previous = data[id].days.slice(-37, -7)
    const values = previous
        .map(d => d.metrics[key])
        .filter((v): v is number => v !== null)
    if (values.length === 0 || recent === null) return null
    const prevAvg = values.reduce((a, b) => a + b, 0) / values.length
    if (prevAvg === 0) return null
    return ((recent - prevAvg) / prevAvg) * 100
}

export interface PeriodSummary {
    totalTraffic: number
    totalLeads: number
    totalLeadsQualified: number
    totalDealsCreated: number
    totalDealsWon: number
    totalDealsLost: number
    avgResponseTime: number | null
    avgDealCycle: number | null
    staleDeals: number
    totalTickets: number
    avgResolutionHours: number | null
    conversionRate: number | null
    qualificationRate: number | null
    winRate: number | null
}

export function getSummary(id: DatasetId, period: number): PeriodSummary {
    const days = getRecentDays(id, period)

    const sum = (key: MetricKey) =>
        days.reduce((acc, d) => acc + (d.metrics[key] ?? 0), 0)

    const avg = (key: MetricKey): number | null => {
        const values = days.map(d => d.metrics[key]).filter((v): v is number => v !== null)
        if (values.length === 0) return null
        return values.reduce((a, b) => a + b, 0) / values.length
    }

    const totalTraffic = sum('traffic')
    const totalLeads = sum('leads_created')
    const totalLeadsQualified = sum('leads_qualified')
    const totalDealsCreated = sum('deals_created')
    const totalDealsWon = sum('deals_won')
    const totalDealsLost = sum('deals_lost')
    const totalTickets = sum('support_tickets_opened')
    const rawResponseTime = avg('avg_response_time_min')
    const rawDealCycle = avg('avg_deal_cycle_days')
    const rawResolution = avg('support_avg_resolution_hours')
    const lastDay = days[days.length - 1]

    return {
        totalTraffic,
        totalLeads,
        totalLeadsQualified,
        totalDealsCreated,
        totalDealsWon,
        totalDealsLost,
        totalTickets,
        staleDeals: lastDay?.metrics.stale_deals ?? 0,
        avgResponseTime: rawResponseTime !== null ? Math.round(rawResponseTime) : null,
        avgDealCycle: rawDealCycle !== null ? Math.round(rawDealCycle) : null,
        avgResolutionHours: rawResolution !== null ? Math.round(rawResolution) : null,
        conversionRate: totalTraffic > 0 ? Math.round((totalLeads / totalTraffic) * 100) : null,
        qualificationRate: totalLeads > 0 ? Math.round((totalLeadsQualified / totalLeads) * 100) : null,
        winRate: (totalDealsWon + totalDealsLost) > 0
            ? Math.round((totalDealsWon / (totalDealsWon + totalDealsLost)) * 100)
            : null,
    }
}

export type AlertType = 'critical' | 'warning' | 'success'

export interface FocusArea {
    key: MetricKey
    label: string
    type: AlertType
    value: string
    description: string
}

const BAD_DESCRIPTIONS: Record<string, string> = {
    traffic: 'Top of funnel weakening — fewer leads coming in.',
    leads_created: 'Lead generation slowing — check marketing activity.',
    leads_qualified: 'Fewer leads passing qualification — review criteria.',
    deals_created: 'Fewer opportunities being opened.',
    deals_won: 'Closing rate declining.',
    deals_lost: 'More deals being lost than usual.',
    avg_response_time_min: 'Slow response hurts conversion — leads going cold.',
    avg_deal_cycle_days: 'Deals taking longer to close.',
    stale_deals: 'Pipeline stagnant — deals need active follow-up.',
    support_tickets_opened: 'Customer issues rising.',
    support_avg_resolution_hours: 'Support taking longer to resolve tickets.',
}

const GOOD_DESCRIPTIONS: Record<string, string> = {
    traffic: 'Traffic growing — top of funnel is healthy.',
    leads_created: 'Lead generation on track.',
    leads_qualified: 'Strong qualification rate.',
    deals_created: 'Pipeline growing with new opportunities.',
    deals_won: 'Closing rate above trend.',
    deals_lost: 'Fewer deals being lost — retention improving.',
    avg_response_time_min: 'Fast response time — leads contacted quickly.',
    avg_deal_cycle_days: 'Deals closing faster than usual.',
    stale_deals: 'Pipeline moving — low stale deal count.',
    support_tickets_opened: 'Support volume under control.',
    support_avg_resolution_hours: 'Support resolving tickets efficiently.',
}

export function getFocusAreas(id: DatasetId): FocusArea[] {
    const metadata = getMetadata(id)
    const bad: FocusArea[] = []
    const good: FocusArea[] = []

    for (const metric of metadata) {
        const delta = getDelta(id, metric.key)
        if (delta === null) continue

        const isBad = metric.direction === 'higher_is_better' ? delta < 0 : delta > 0
        const absD = Math.abs(delta)
        const formattedValue = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`

        if (isBad) {
            bad.push({
                key: metric.key,
                label: metric.label,
                type: absD > 15 ? 'critical' : 'warning',
                value: formattedValue,
                description: BAD_DESCRIPTIONS[metric.key] ?? '',
            })
        } else {
            good.push({
                key: metric.key,
                label: metric.label,
                type: 'success',
                value: formattedValue,
                description: GOOD_DESCRIPTIONS[metric.key] ?? '',
            })
        }
    }

    bad.sort((a, b) => Math.abs(parseFloat(b.value)) - Math.abs(parseFloat(a.value)))
    good.sort((a, b) => Math.abs(parseFloat(b.value)) - Math.abs(parseFloat(a.value)))

    const result = [...bad.slice(0, 3)]
    if (result.length < 3) {
        result.push(...good.slice(0, 3 - result.length))
    }
    return result
}

export function getWinRate(id: DatasetId, last: number): number | null {
    const days = getRecentDays(id, last)
    const won = days.reduce((sum, d) => sum + d.metrics.deals_won, 0)
    const lost = days.reduce((sum, d) => sum + d.metrics.deals_lost, 0)
    if (won + lost === 0) return null
    return won / (won + lost)
}

export interface FunnelStep {
    label: string
    value: number
    rate: number | null
}

export function getFunnelSteps(id: DatasetId, last: number): FunnelStep[] {
    const days = getRecentDays(id, last)
    const sum = (key: MetricKey) =>
        days.reduce((acc, d) => acc + (d.metrics[key] ?? 0), 0)

    const steps = [
        { label: 'Traffic', value: sum('traffic') },
        { label: 'Leads', value: sum('leads_created') },
        { label: 'Qualified', value: sum('leads_qualified') },
        { label: 'Deals', value: sum('deals_created') },
        { label: 'Won', value: sum('deals_won') },
    ]

    return steps.map((step, i) => ({
        ...step,
        rate: i === 0 ? null : steps[i - 1].value > 0
            ? step.value / steps[i - 1].value
            : null,
    }))
}

export interface SparklinePoint {
    date: string
    value: number | null
}

export function getSparkline(id: DatasetId, key: MetricKey, last: number): SparklinePoint[] {
    return getRecentDays(id, last).map(d => ({
        date: d.date,
        value: d.metrics[key],
    }))
}