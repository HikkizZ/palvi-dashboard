import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { getFunnelSteps } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import { cn } from '@/lib/utils'

interface Props {
    dataset: DatasetId
    period: number
}

function fmt(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
}

export function FunnelChart({ dataset, period }: Props) {
    const steps = getFunnelSteps(dataset, period)
    const max = steps[0]?.value ?? 1

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Sales Funnel</CardTitle>
                <CardDescription>Conversion rates through pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {steps.map((step) => {
                        const pct = (step.value / max) * 100
                        const rate = step.rate !== null ? Math.round(step.rate * 100) : null
                        const rateGood = rate !== null && rate >= 50
                        const rateMid = rate !== null && rate >= 30 && rate < 50

                        return (
                            <div key={step.label}>
                                {rate !== null && (
                                    <div className="flex items-center gap-1 mb-1 ml-1">
                                        <span className="text-xs text-muted-foreground">↓</span>
                                        <span className={cn(
                                            'text-xs font-medium',
                                            rateGood && 'text-success',
                                            rateMid && 'text-warning',
                                            !rateGood && !rateMid && 'text-destructive',
                                        )}>
                                            {rate}%
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{step.label}</span>
                                    <span className="font-medium text-foreground">{fmt(step.value)}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${Math.max(pct, 2)}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}