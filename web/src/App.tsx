import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Phonikud User Study</CardTitle>
          <CardDescription>Testing shadcn/ui with Tailwind CSS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Button clicked:</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
          <Button onClick={() => setCount(count + 1)} className="w-full">
            Click me
          </Button>
          <Button variant="secondary" onClick={() => setCount(0)} className="w-full">
            Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
