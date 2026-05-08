import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getSummary, getSparkline } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import { cn } from '@/lib/utils'

interface Props {
    dataset: DatasetId
    period: number
}

export function SupportSection({ dataset, period }: Props) {
    const s = getSummary(dataset, period)
    const ticketSpark = getSparkline(dataset, 'support_tickets_opened', period)
    const resSpark = getSparkline(dataset, 'support_avg_resolution_hours', period)

    const resGood = s.avgResolutionHours !== null && s.avgResolutionHours <= 8
    const resBad = s.avgResolutionHours !== null && s.avgResolutionHours > 12

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">Support Tickets</CardTitle>
                    <CardDescription>Tickets opened per day</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                    <span className="text-2xl font-bold text-foreground">{s.totalTickets}</span>
                    <div className="h-20 w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={ticketSpark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" hide />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        return (
                                            <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-sm">
                                                {payload[0].value} tickets
                                            </div>
                                        )
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="var(--color-primary)"
                                    radius={[2, 2, 0, 0]}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">Avg Resolution Time</CardTitle>
                    <CardDescription>Hours to resolve a support ticket</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">
                            {s.avgResolutionHours !== null ? `${s.avgResolutionHours}h` : '—'}
                        </span>
                        <span className={cn(
                            'text-xs font-medium pb-1',
                            resGood && 'text-success',
                            resBad && 'text-destructive',
                            !resGood && !resBad && 'text-warning',
                        )}>
                            {resGood ? 'On target' : resBad ? 'Critical' : 'Elevated'}
                        </span>
                    </div>
                    <div className="h-20 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={resSpark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" hide />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        return (
                                            <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-sm">
                                                {payload[0].value}h
                                            </div>
                                        )
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="var(--color-chart-2)"
                                    radius={[2, 2, 0, 0]}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">Target ≤ 8h</p>
                </CardContent>
            </Card>
        </div>
    )
}