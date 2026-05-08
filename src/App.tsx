import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DatasetId } from '@/data/types'

const DATASETS: DatasetId[] = ['A', 'B', 'C', 'D']

function App() {

  const [dataset, setDataset] = useState<DatasetId>('A')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Sales Dashboard</h1>
            <p className="text-sm text-muted-foreground">Executive report</p>
          </div>
          <Tabs value={dataset} onValueChange={(v) => setDataset(v as DatasetId)}>
            <TabsList>
              {DATASETS.map(id => (
                <TabsTrigger key={id} value={id}>Dataset {id}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground">Dataset activo: {dataset}</p>
      </main>
    </div>
  )
}

export default App