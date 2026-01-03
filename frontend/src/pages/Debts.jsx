import { useEffect, useState } from 'react'
import { analyticsAPI, paymentsAPI, exportAPI } from '../services/api'
import toast from 'react-hot-toast'
import { ArrowDownTrayIcon, PhoneIcon, BanknotesIcon } from '@heroicons/react/24/outline'

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function Debts() {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(0)

  useEffect(() => { loadDebts() }, [])

  const loadDebts = async () => {
    try {
      const res = await analyticsAPI.getDebts()
      setDebts(res.data)
    } catch { toast.error('Failed to load debts') }
    finally { setLoading(false) }
  }

  const handleExport = async () => {
    try {
      const response = await exportAPI.debts()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'customer_debts.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export downloaded')
    } catch { toast.error('Export failed') }
  }

  const totalOwed = debts.reduce((sum, d) => sum + d.total_owed, 0)

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Who Owes What</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track outstanding customer debts</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <ArrowDownTrayIcon className="h-5 w-5" /> Export to Excel
        </button>
      </div>

      {/* Summary Card */}
      <div className="card p-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Total Outstanding</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalOwed)}</p>
            <p className="text-red-100 text-sm mt-2">From {debts.length} customers</p>
          </div>
          <div className="p-4 bg-white/20 rounded-2xl">
            <BanknotesIcon className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Unpaid Sales</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Last Sale</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Amount Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {debts.map((debt) => (
                <tr key={debt.customer_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{debt.customer_name.charAt(0)}</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{debt.customer_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {debt.customer_phone ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <PhoneIcon className="h-4 w-4" /> {debt.customer_phone}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      {debt.sales_count} sale{debt.sales_count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {debt.last_sale_date ? new Date(debt.last_sale_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(debt.total_owed)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {debts.length === 0 && (
            <div className="text-center py-12">
              <BanknotesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No outstanding debts!</p>
              <p className="text-sm text-gray-400">All customers have paid in full</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
