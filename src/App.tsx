import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FocusPanel } from '@/components/FocusPanel'
import { StatsGrid } from '@/components/StatsGrid'
import { TrafficChart } from '@/components/TrafficChart'
import { FunnelChart } from '@/components/FunnelChart'
import { WinRateCard } from '@/components/WinRateCard'
import { ResponseTimeCard } from '@/components/ResponseTimeCard'
import { SupportSection } from '@/components/SupportSection'
import { MetricCards } from '@/components/MetricCards'
import type { DatasetId } from '@/data/types'

const DATASETS: DatasetId[] = ['A', 'B', 'C', 'D']
const PERIODS = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
]

function App() {
  const [dataset, setDataset] = useState<DatasetId>('A')
  const [period, setPeriod] = useState(30)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Sales Dashboard</h1>
            <p className="text-sm text-muted-foreground">Executive overview · Head of Sales</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
              <TabsList>
                {PERIODS.map(p => (
                  <TabsTrigger key={p.value} value={p.value.toString()}>{p.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Tabs value={dataset} onValueChange={(v) => setDataset(v as DatasetId)}>
              <TabsList>
                {DATASETS.map(id => (
                  <TabsTrigger key={id} value={id}>Dataset {id}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <FocusPanel dataset={dataset} />
        <StatsGrid dataset={dataset} period={period} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrafficChart dataset={dataset} period={period} />
          </div>
          <FunnelChart dataset={dataset} period={period} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WinRateCard dataset={dataset} period={period} />
          <ResponseTimeCard dataset={dataset} period={period} />
          <MetricCards dataset={dataset} period={period} />
        </div>

        <SupportSection dataset={dataset} period={period} />
      </main>
    </div>
  )
}

export default App