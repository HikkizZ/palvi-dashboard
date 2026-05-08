import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Target, Trophy, Clock } from 'lucide-react'
import { getSummary } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import { cn } from '@/lib/utils'

interface StatCardProps {
    label: string
    value: string
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
    icon: ReactNode
}

function StatCard({ label, value, change, changeType = 'neutral', icon }: StatCardProps) {
    return (
        <Card className="py-4 px-5 gap-3 bg-card border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{label}</span>
                <div className="p-1.5 bg-secondary rounded-md">{icon}</div>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                {change && (
                    <span className={cn(
                        'text-xs font-medium flex items-center gap-0.5 pb-1',
                        changeType === 'positive' && 'text-success',
                        changeType === 'negative' && 'text-destructive',
                        changeType === 'neutral' && 'text-muted-foreground'
                    )}>
                        {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                        {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                        {change}
                    </span>
                )}
            </div>
        </Card>
    )
}

function fmt(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
}

interface Props {
    dataset: DatasetId
    period: number
}

export function StatsGrid({ dataset, period }: Props) {
    const s = getSummary(dataset, period)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
                label="Total Traffic"
                value={fmt(s.totalTraffic)}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                label="Leads Created"
                value={fmt(s.totalLeads)}
                change={s.conversionRate !== null ? `${s.conversionRate}% conv` : undefined}
                changeType={s.conversionRate !== null ? (s.conversionRate > 3 ? 'positive' : 'negative') : 'neutral'}
                icon={<Target className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                label="Deals Created"
                value={s.totalDealsCreated.toString()}
                change={s.qualificationRate !== null ? `${s.qualificationRate}% qualified` : undefined}
                changeType={s.qualificationRate !== null ? (s.qualificationRate > 50 ? 'positive' : 'neutral') : 'neutral'}
                icon={<Target className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                label="Deals Won"
                value={s.totalDealsWon.toString()}
                change={s.winRate !== null ? `${s.winRate}% win rate` : undefined}
                changeType={s.winRate !== null ? (s.winRate >= 60 ? 'positive' : s.winRate < 45 ? 'negative' : 'neutral') :
                    'neutral'}
                icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                label="Avg Response"
                value={s.avgResponseTime !== null ? `${s.avgResponseTime} min` : '—'}
                change={s.avgResponseTime !== null ? (s.avgResponseTime <= 30 ? 'On target' : 'Slow') : undefined}
                changeType={s.avgResponseTime !== null ? (s.avgResponseTime <= 30 ? 'positive' : 'negative') : 'neutral'}
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                label="Support Tickets"
                value={s.totalTickets.toString()}
                change={s.avgResolutionHours !== null ? `${s.avgResolutionHours}h avg` : undefined}
                changeType={s.avgResolutionHours !== null ? (s.avgResolutionHours <= 8 ? 'positive' : s.avgResolutionHours
                    > 12 ? 'negative' : 'neutral') : 'neutral'}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    )
}