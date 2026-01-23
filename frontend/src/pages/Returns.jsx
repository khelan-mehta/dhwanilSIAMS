import { useEffect, useState, useCallback } from 'react'
import { returnsAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  ArrowUturnLeftIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function Returns() {
  const [activeTab, setActiveTab] = useState('sales')
  const [salesReturns, setSalesReturns] = useState([])
  const [purchaseReturns, setPurchaseReturns] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const getFilterParams = useCallback(() => {
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return params
  }, [startDate, endDate])

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = getFilterParams()
      const [salesRes, purchasesRes, summaryRes] = await Promise.all([
        returnsAPI.getSalesReturns(params),
        returnsAPI.getPurchaseReturns(params),
        returnsAPI.getSummary(),
      ])
      setSalesReturns(salesRes.data)
      setPurchaseReturns(purchasesRes.data)
      setSummary(summaryRes.data)
    } catch (error) {
      toast.error('Failed to load returns data')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = startDate || endDate

  if (loading && salesReturns.length === 0 && purchaseReturns.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Returns & Refunds</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track sales and purchase returns</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <ArrowUturnLeftIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sales Returns</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.total_sales_returns}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ArrowUturnLeftIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Returns</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.total_purchase_returns}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sales Refunds</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.total_sales_refund_amount)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Refunds</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.total_purchase_refund_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {[startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'sales'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sales Returns ({salesReturns.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Purchase Returns ({purchaseReturns.length})
          </button>
        </nav>
      </div>

      {/* Sales Returns Table */}
      {activeTab === 'sales' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Return Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sale ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Return Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Refund Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Profit Adj.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {salesReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(ret.return_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">#{ret.sale_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ret.product?.name || `Product #${ret.product_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{ret.return_qty}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(ret.refund_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ret.refund_method === 'cash'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {ret.refund_method.charAt(0).toUpperCase() + ret.refund_method.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(ret.profit_adjustment)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {ret.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {salesReturns.length === 0 && (
              <div className="text-center py-12">
                <ArrowUturnLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? 'No sales returns match your filters' : 'No sales returns found'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Returns Table */}
      {activeTab === 'purchases' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Return Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Purchase ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Return Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Refund Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(ret.return_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">#{ret.purchase_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ret.product?.name || `Product #${ret.product_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{ret.return_qty}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(ret.refund_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ret.refund_method === 'cash'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {ret.refund_method.charAt(0).toUpperCase() + ret.refund_method.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {ret.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {purchaseReturns.length === 0 && (
              <div className="text-center py-12">
                <ArrowUturnLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? 'No purchase returns match your filters' : 'No purchase returns found'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
