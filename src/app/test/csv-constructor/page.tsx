'use client'

import { MessageConstructor } from '@/components/MessageConstructor'
import { Config } from '@/components/MessageConstructor/store'

// Mock data for testing
const MOCK_COLUMNS = [
  { id: '1', name: 'Customer Name', selected: false, order: 0 },
  { id: '2', name: 'Revenue', selected: true, order: 1 },
  { id: '3', name: 'Industry', selected: false, order: 2 },
  { id: '4', name: 'Employee Count', selected: false, order: 3 },
  { id: '5', name: 'Location', selected: false, order: 4 },
  { id: '6', name: 'Founded Year', selected: false, order: 5 },
  { id: '7', name: 'Annual Growth', selected: false, order: 6 },
  { id: '8', name: 'Market Share', selected: false, order: 7 },
  { id: '9', name: 'Customer Satisfaction', selected: false, order: 8 },
  { id: '10', name: 'Product Categories', selected: false, order: 9 },
  { id: '11', name: 'Last Contact Date', selected: false, order: 10 },
  { id: '12', name: 'Account Manager', selected: false, order: 11 },
  { id: '13', name: 'Contract Value', selected: false, order: 12 },
  { id: '14', name: 'Renewal Date', selected: false, order: 13 },
  { id: '15', name: 'Support Tier', selected: false, order: 14 },
  { id: '16', name: 'Integration Status', selected: false, order: 15 },
  { id: '17', name: 'Custom Fields', selected: false, order: 16 },
  { id: '18', name: 'Notes', selected: false, order: 17 },
  { id: '19', name: 'Tags', selected: false, order: 18 },
  { id: '20', name: 'Priority Level', selected: false, order: 19 },
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

/**
 * Test page for the MessageConstructor component
 */
export default function TestPage() {
  const handleConfigUpdate = (config: Config) => {
    console.log('Config updated:', config)
  }

  /**
   * This page demonstrates the MessageConstructor component with mock data.
   */
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Message Constructor Test Page</h1>
      <MessageConstructor
        mockColumns={MOCK_COLUMNS}
        mockFirstRow={MOCK_FIRST_ROW}
        onConfigUpdate={handleConfigUpdate}
      />
    </div>
  )
} 