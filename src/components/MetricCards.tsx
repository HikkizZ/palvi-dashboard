import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getSummary } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import { cn } from '@/lib/utils'

interface Props {
    dataset: DatasetId
    period: number
}

export function MetricCards({ dataset, period }: Props) {
    const s = getSummary(dataset, period)

    const cycleGood = s.avgDealCycle !== null && s.avgDealCycle <= 30
    const cycleBad = s.avgDealCycle !== null && s.avgDealCycle > 45

    const staleGood = s.staleDeals <= 5
    const staleBad = s.staleDeals > 15

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-base">Deal Cycle</CardTitle>
                    <CardDescription>Avg days to close a deal</CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">
                            {s.avgDealCycle !== null ? `${s.avgDealCycle} ${s.avgDealCycle === 1 ? 'day' : 'days'}` : '—'}
                        </span>
                        <span className={cn(
                            'text-xs font-medium pb-1',
                            cycleGood && 'text-success',
                            cycleBad && 'text-destructive',
                            !cycleGood && !cycleBad && 'text-warning',
                        )}>
                            {cycleGood ? 'Fast' : cycleBad ? 'Slow' : 'Average'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target ≤ 30 days</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-base">Stale Deals</CardTitle>
                    <CardDescription>Deals with no activity</CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">
                            {s.staleDeals}
                        </span>
                        <span className={cn(
                            'text-xs font-medium pb-1',
                            staleGood && 'text-success',
                            staleBad && 'text-destructive',
                            !staleGood && !staleBad && 'text-warning',
                        )}>
                            {staleGood ? 'Healthy' : staleBad ? 'Action needed' : 'Monitor'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target ≤ 5</p>
                </CardContent>
            </Card>
        </div>
    )
}