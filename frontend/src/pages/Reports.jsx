import { useState } from 'react'
import { exportAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

const reports = [
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Complete list of all products with stock levels, prices, and valuations',
    icon: CubeIcon,
    color: 'bg-blue-500',
    export: exportAPI.inventory,
    filename: 'inventory.xlsx',
  },
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'All sales transactions with customer details, amounts, and profit margins',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
    export: exportAPI.sales,
    filename: 'sales_report.xlsx',
  },
  {
    id: 'purchases',
    name: 'Purchases Report',
    description: 'All purchase transactions from suppliers with quantities and costs',
    icon: ShoppingCartIcon,
    color: 'bg-purple-500',
    export: exportAPI.purchases,
    filename: 'purchases_report.xlsx',
  },
  {
    id: 'debts',
    name: 'Customer Debts Report',
    description: 'Outstanding balances for all customers who owe money',
    icon: CreditCardIcon,
    color: 'bg-red-500',
    export: exportAPI.debts,
    filename: 'customer_debts.xlsx',
  },
]

export default function Reports() {
  const [downloading, setDownloading] = useState(null)

  const handleDownload = async (report) => {
    setDownloading(report.id)
    try {
      const response = await report.export()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', report.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${report.name} downloaded`)
    } catch (error) {
      toast.error(`Failed to download ${report.name}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Export your data to Excel spreadsheets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${report.color} text-white`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {report.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {report.description}
                </p>
                <button
                  onClick={() => handleDownload(report)}
                  disabled={downloading === report.id}
                  className="mt-4 btn-primary flex items-center gap-2"
                >
                  {downloading === report.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center gap-4">
          <DocumentChartBarIcon className="h-12 w-12" />
          <div>
            <h3 className="text-lg font-semibold">Need custom reports?</h3>
            <p className="text-primary-100 mt-1">
              All reports are exported in Excel format (.xlsx) for easy analysis and sharing.
              You can open them in Microsoft Excel, Google Sheets, or any spreadsheet application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
