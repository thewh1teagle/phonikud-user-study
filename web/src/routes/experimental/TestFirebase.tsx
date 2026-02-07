import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitSubmission, exportToCSV } from '@/lib/firebase'

export default function TestFirebase() {
  const [status, setStatus] = useState('')
  const [csvData, setCsvData] = useState('')

  const handleSubmit = async () => {
    try {
      setStatus('Submitting...')
      await submitSubmission({
        name: 'Test User',
        email: 'test@example.com',
        sentence_id: '0',
        model_a: 'styletts2',
        model_b: 'roboshaul',
        naturalness_cmos: 2,
        accuracy_cmos: -1
      })
      setStatus('Submission successful!')
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleExport = async () => {
    try {
      setStatus('Exporting...')
      const csv = await exportToCSV()
      setCsvData(csv)
      setStatus('Export successful!')
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>Firebase Test</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Button onClick={handleSubmit}>Submit Test Data</Button>
        <Button onClick={handleExport}>Export to CSV</Button>
      </div>

      {status && (
        <div style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '1rem' }}>
          {status}
        </div>
      )}

      {csvData && (
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>CSV Output:</h2>
          <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
            {csvData}
          </pre>
        </div>
      )}
    </div>
  )
}
