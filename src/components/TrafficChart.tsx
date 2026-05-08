import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRecentDays } from '@/data/queries'
import type { DatasetId } from '@/data/types'

interface Props {
    dataset: DatasetId
    period: number
}

export function TrafficChart({ dataset, period }: Props) {
    const days = getRecentDays(dataset, period)

    const chartData = days.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        traffic: d.metrics.traffic,
        leads: d.metrics.leads_created,
    }))

    return (
        <Card className="col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Traffic & Leads</CardTitle>
                <CardDescription>Daily website visits and lead generation</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-70 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                yAxisId="traffic"
                                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
                                label={{ value: 'Visits', angle: -90, position: 'insideLeft', offset: 10, style: { fill: 'oklch(0.65 0 0)', fontSize: 11 } }}
                            />
                            <YAxis
                                yAxisId="leads"
                                orientation="right"
                                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Leads', angle: 90, position: 'insideRight', offset: 10, style: { fill: 'oklch(0.65 0 0)', fontSize: 11 } }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'oklch(0.16 0.01 260)',
                                    border: '1px solid oklch(0.28 0.01 260)',
                                    borderRadius: '8px',
                                    color: 'oklch(0.98 0 0)',
                                }}
                                labelStyle={{ color: 'oklch(0.65 0 0)' }}
                            />
                            <Area yAxisId="traffic" type="monotone" dataKey="traffic"
                                stroke="oklch(0.65 0.2 250)" strokeWidth={2}
                                fill="url(#trafficGradient)" name="Traffic"
                            />
                            <Area yAxisId="leads" type="monotone" dataKey="leads"
                                stroke="oklch(0.65 0.2 145)" strokeWidth={2}
                                fill="url(#leadsGradient)" name="Leads"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.65 0.2 250)' }} />
                        <span className="text-xs text-muted-foreground">Traffic</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.65 0.2 145)' }} />
                        <span className="text-xs text-muted-foreground">Leads</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}