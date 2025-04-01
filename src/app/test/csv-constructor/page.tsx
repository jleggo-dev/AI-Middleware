'use client'

import { CSVMessageConstructor } from '@/components/CSVMessageConstructor'
import { CSVConfig } from '@/components/CSVMessageConstructor/store'

// Mock data for testing
const MOCK_COLUMNS = [
  { id: '1', name: 'Customer Name', selected: false },
  { id: '2', name: 'Revenue', selected: true },
  { id: '3', name: 'Industry', selected: false },
  { id: '4', name: 'Employee Count', selected: false },
  { id: '5', name: 'Location', selected: false },
  { id: '6', name: 'Founded Year', selected: false },
  { id: '7', name: 'Annual Growth', selected: false },
  { id: '8', name: 'Market Share', selected: false },
  { id: '9', name: 'Customer Satisfaction', selected: false },
  { id: '10', name: 'Product Categories', selected: false },
  { id: '11', name: 'Last Contact Date', selected: false },
  { id: '12', name: 'Account Manager', selected: false },
  { id: '13', name: 'Contract Value', selected: false },
  { id: '14', name: 'Renewal Date', selected: false },
  { id: '15', name: 'Support Tier', selected: false },
  { id: '16', name: 'Integration Status', selected: false },
  { id: '17', name: 'Custom Fields', selected: false },
  { id: '18', name: 'Notes', selected: false },
  { id: '19', name: 'Tags', selected: false },
  { id: '20', name: 'Priority Level', selected: false },
]

const MOCK_FIRST_ROW = {
  'Customer Name': 'Acme Corporation',
  'Revenue': '$1.2M',
  'Industry': 'Technology',
  'Employee Count': '150',
  'Location': 'San Francisco, CA',
  'Founded Year': '2015',
  'Annual Growth': '25%',
  'Market Share': '15%',
  'Customer Satisfaction': '4.8/5',
  'Product Categories': 'Enterprise, SMB',
  'Last Contact Date': '2024-03-15',
  'Account Manager': 'John Smith',
  'Contract Value': '$500K',
  'Renewal Date': '2025-01-01',
  'Support Tier': 'Premium',
  'Integration Status': 'Complete',
  'Custom Fields': 'N/A',
  'Notes': 'Key strategic partner',
  'Tags': 'Enterprise, Strategic',
  'Priority Level': 'High'
}

export default function CSVConstructorTestPage() {
  const handleConfigUpdate = (config: CSVConfig) => {
    console.log('CSV Config Updated:', config)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">CSV Message Constructor Test</h1>
        <p className="text-gray-600">
          This page demonstrates the CSVMessageConstructor component with mock data.
          Check the browser console for config updates.
        </p>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <CSVMessageConstructor
          mockColumns={MOCK_COLUMNS}
          mockFirstRow={MOCK_FIRST_ROW}
          onConfigUpdate={handleConfigUpdate}
        />
      </div>
    </div>
  )
} 