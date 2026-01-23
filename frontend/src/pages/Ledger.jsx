import { useEffect, useState, useCallback } from 'react'
import { ledgerAPI, accountsAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  BookOpenIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
}

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'sale', label: 'Sales' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'payment', label: 'Payments' },
  { value: 'sales_return', label: 'Sales Returns' },
  { value: 'purchase_return', label: 'Purchase Returns' },
  { value: 'adjustment', label: 'Adjustments' },
]

export default function Ledger() {
  const [entries, setEntries] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [accountFilter, setAccountFilter] = useState('')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const getFilterParams = useCallback(() => {
    const params = {}
    if (accountFilter) params.account_id = accountFilter
    if (transactionTypeFilter) params.transaction_type = transactionTypeFilter
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return params
  }, [accountFilter, transactionTypeFilter, startDate, endDate])

  useEffect(() => {
    accountsAPI.getAll().then(res => setAccounts(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadEntries()
  }, [accountFilter, transactionTypeFilter, startDate, endDate])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const params = getFilterParams()
      const res = await ledgerAPI.getAll(params)
      setEntries(res.data)
    } catch (error) {
      toast.error('Failed to load ledger entries')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setAccountFilter('')
    setTransactionTypeFilter('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = accountFilter || transactionTypeFilter || startDate || endDate

  // Calculate totals
  const totalDebits = entries.reduce((sum, e) => sum + e.debit_amount, 0)
  const totalCredits = entries.reduce((sum, e) => sum + e.credit_amount, 0)

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Ledger</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View all accounting entries</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Debits</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalDebits)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Credits</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalCredits)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{entries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-100 dark:bg-primary-900/20' : ''}`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {[accountFilter, transactionTypeFilter, startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="label">Account</label>
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Transaction Type</label>
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="input"
                >
                  {transactionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">From Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="label">To Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          {loading && <span className="ml-2 animate-pulse">Loading...</span>}
        </div>
      )}

      {/* Ledger Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Narration</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Debit</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Credit</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(entry.entry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.account?.name || `Account #${entry.account_id}`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      entry.transaction_type === 'sale' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      entry.transaction_type === 'purchase' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      entry.transaction_type === 'payment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      entry.transaction_type.includes('return') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {entry.transaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {entry.narration || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                    {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-red-600 dark:text-red-400">
                    {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(entry.balance_after)}
                  </td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Totals
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalDebits)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalCredits)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            )}
          </table>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilters ? 'No entries match your filters' : 'No ledger entries found'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
