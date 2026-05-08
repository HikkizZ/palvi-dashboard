import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFocusAreas } from '@/data/queries'
import type { DatasetId } from '@/data/types'
import type { AlertType } from '@/data/queries'
import { cn } from '@/lib/utils'

const ICON = {
    critical: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
}

const COLORS = {
    critical: {
        bg: 'bg-destructive/10',
        border: 'border-destructive/30',
        icon: 'text-destructive',
        badge: 'destructive' as const,
    },
    warning: {
        bg: 'bg-warning/10',
        border: 'border-warning/30',
        icon: 'text-warning',
        badge: 'warning' as const,
    },
    success: {
        bg: 'bg-success/10',
        border: 'border-success/30',
        icon: 'text-success',
        badge: 'success' as const,
    },
}

interface Props {
    dataset: DatasetId
}

export function FocusPanel({ dataset }: Props) {
    const areas = getFocusAreas(dataset)
    const critical = areas.filter(a => a.type === 'critical').length
    const warning = areas.filter(a => a.type === 'warning').length
    const success = areas.filter(a => a.type === 'success').length

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Focus Areas</h2>
                <div className="flex items-center gap-2">
                    {critical > 0 && (
                        <Badge variant="destructive" className="text-xs">{critical} Critical</Badge>
                    )}
                    {warning > 0 && (
                        <Badge variant="warning" className="text-xs">{warning} Warning</Badge>
                    )}
                    {success > 0 && (
                        <Badge variant="success" className="text-xs">{success} On Track</Badge>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {areas.map((area) => {
                    const colors = COLORS[area.type as AlertType]
                    return (
                        <Card key={area.key} className={cn('py-4 gap-0', colors.bg, colors.border)}>
                            <CardContent className="px-4">
                                <div className="flex items-start gap-3">
                                    <div className={cn('mt-0.5', colors.icon)}>{ICON[area.type as AlertType]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-medium text-foreground text-sm truncate">{area.label}</h4>
                                            <Badge variant={colors.badge} className="shrink-0">{area.value}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{area.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}