import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getSummary, getSparkline } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import { cn } from '@/lib/utils'

interface Props {
    dataset: DatasetId
    period: number
}

export function ResponseTimeCard({ dataset, period }: Props) {
    const s = getSummary(dataset, period)
    const spark = getSparkline(dataset, 'avg_response_time_min', period)

    const avg = s.avgResponseTime
    const good = avg !== null && avg <= 30
    const bad = avg !== null && avg > 60

    return (
        <Card>
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Avg Response Time</CardTitle>
                <CardDescription>Time to first contact after lead creation</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-foreground">
                        {avg !== null ? `${avg} min` : '—'}
                    </span>
                    <span className={cn(
                        'text-xs font-medium pb-1',
                        good && 'text-success',
                        bad && 'text-destructive',
                        !good && !bad && 'text-warning',
                    )}>
                        {good ? 'On target' : bad ? 'Critical' : 'Slow'}
                    </span>
                </div>
                <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null
                                    const v = payload[0].value
                                    return (
                                        <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs text-foreground shadow-sm">
                                            {v != null ? `${v} min` : '—'}
                                        </div>
                                    )
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--color-primary)"
                                strokeWidth={1.5}
                                fill="url(#rtGrad)"
                                dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground">Target ≤ 30 min</p>
            </CardContent>
        </Card>
    )
}