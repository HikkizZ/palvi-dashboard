import rawData from './metrics.json'
import type { MetricsData, DatasetId, MetricKey, Direction } from './types'

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

export interface Alert {
    key: MetricKey
    label: string
    delta: number
    direction: Direction
    unit: string
}

export function getAlerts(id: DatasetId): Alert[] {
    const metadata = getMetadata(id)
    const alerts: Alert[] = []

    for (const metric of metadata) {
        const delta = getDelta(id, metric.key)
        if (delta === null) continue

        const isBad = metric.direction === 'higher_is_better' ? delta < 0 : delta > 0
        if (!isBad) continue

        alerts.push({
            key: metric.key,
            label: metric.label,
            delta,
            direction: metric.direction,
            unit: metric.unit
        })
    }

    alerts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

    return alerts.slice(0, 3)
}

export function getWinRate(id: DatasetId, last: number): number | null {
    const days = getRecentDays(id, last)
    const won = days.reduce((sum, d) => sum + d.metrics.deals_won, 0)
    const lost = days.reduce((sum, d) => sum + d.metrics.deals_lost, 0)

    if (won + lost === 0) return null

    return (won / (won + lost)) * 100
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