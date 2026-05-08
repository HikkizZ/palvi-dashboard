import { PieChart, Pie, Cell } from 'recharts'
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
  import { getWinRate } from '@/data/queries'
  import type { DatasetId } from '@/data/types'
  import { cn } from '@/lib/utils'

  interface Props {
      dataset: DatasetId
      period: number
  }

  export function WinRateCard({ dataset, period }: Props) {
      const rate = getWinRate(dataset, period)
      const prev = getWinRate(dataset, period * 2)

      const pct = rate !== null ? Math.round(rate * 100) : null
      const prevPct = prev !== null ? Math.round(prev * 100) : null
      const delta = pct !== null && prevPct !== null ? pct - prevPct : null

      const good = pct !== null && pct >= 60
      const mid = pct !== null && pct >= 45 && pct < 60
      const bad = pct !== null && pct < 45

      const color = good ? 'var(--color-success)' : mid ? 'var(--color-warning)' : 'var(--color-destructive)'
      const filled = pct ?? 0
      const gaugeData = [{ value: filled }, { value: 100 - filled }]

      return (
          <Card>
              <CardHeader className="pb-0">
                  <CardTitle className="text-base">Win Rate</CardTitle>
                  <CardDescription>Deals won vs closed (won + lost)</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4 pt-2">
                  <div className="relative w-24 h-24 shrink-0">
                      <PieChart width={96} height={96}>
                          <Pie
                              data={gaugeData}
                              cx={44}
                              cy={44}
                              startAngle={90}
                              endAngle={-270}
                              innerRadius={32}
                              outerRadius={44}
                              dataKey="value"
                              strokeWidth={0}
                          >
                              <Cell fill={pct !== null ? color : 'var(--color-muted)'} />
                              <Cell fill="var(--color-secondary)" />
                          </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-foreground">
                              {pct !== null ? `${pct}%` : '—'}
                          </span>
                      </div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className={cn(
                          'text-sm font-medium',
                          good && 'text-success',
                          mid && 'text-warning',
                          bad && 'text-destructive',
                      )}>
                          {good ? 'Strong close rate' : mid ? 'Acceptable' : 'Below target'}
                      </span>
                      {delta !== null && (
                          <span className={cn(
                              'text-xs',
                              delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground',
                          )}>
                              {delta > 0 ? '+' : ''}{delta}pp vs prev period
                          </span>
                      )}
                      <span className="text-xs text-muted-foreground">Target ≥ 60%</span>
                  </div>
              </CardContent>
          </Card>
      )
  }