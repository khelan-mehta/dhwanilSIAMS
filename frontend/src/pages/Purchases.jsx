import { useEffect, useState, useCallback } from 'react'
import { purchasesAPI, productsAPI, suppliersAPI, exportAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [form, setForm] = useState({
    supplier_id: '',
    product_id: '',
    qty: 1,
    purchase_price: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Build filter params
  const getFilterParams = useCallback(() => {
    const params = {}
    if (supplierFilter) params.supplier_id = supplierFilter
    if (productFilter) params.product_id = productFilter
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return params
  }, [supplierFilter, productFilter, startDate, endDate])

  // Load supporting data on mount
  useEffect(() => {
    Promise.all([
      productsAPI.getAll(),
      suppliersAPI.getAll(),
    ]).then(([productsRes, suppliersRes]) => {
      setProducts(productsRes.data)
      setSuppliers(suppliersRes.data)
    }).catch(() => {})
  }, [])

  // Load purchases when filters change
  useEffect(() => {
    loadPurchases()
  }, [supplierFilter, productFilter, startDate, endDate])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const params = getFilterParams()
      const purchasesRes = await purchasesAPI.getAll(params)
      setPurchases(purchasesRes.data)
    } catch (error) {
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === Number(productId))
    setForm({
      ...form,
      product_id: productId,
      purchase_price: product?.cost_price || 0,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await purchasesAPI.create({
        ...form,
        supplier_id: Number(form.supplier_id),
        product_id: Number(form.product_id),
        qty: Number(form.qty),
        purchase_price: Number(form.purchase_price),
      })
      toast.success('Purchase recorded - stock updated')
      loadPurchases()
      // Reload products to get updated stock
      productsAPI.getAll().then(res => setProducts(res.data))
      setShowModal(false)
      setForm({
        supplier_id: '',
        product_id: '',
        qty: 1,
        purchase_price: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record purchase')
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const params = getFilterParams()
      const response = await exportAPI.purchases(params)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'purchases_report.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Export downloaded successfully')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setSupplierFilter('')
    setProductFilter('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = supplierFilter || productFilter || startDate || endDate

  const totalAmount = Number(form.qty) * Number(form.purchase_price)

  // Client-side search filtering (for supplier/product name search)
  const filteredPurchases = purchases.filter((p) =>
    !search ||
    p.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && purchases.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchases</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Record inventory purchases from suppliers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            New Purchase
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by supplier or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-100 dark:bg-primary-900/20' : ''}`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {[supplierFilter, productFilter, startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Supplier Filter */}
              <div>
                <label className="label">Supplier</label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Filter */}
              <div>
                <label className="label">Product</label>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
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

              {/* End Date */}
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

              {/* Reset Filters */}
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
      {(hasActiveFilters || search) && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredPurchases.length} {filteredPurchases.length === 1 ? 'result' : 'results'}
          {loading && <span className="ml-2 animate-pulse">Loading...</span>}
        </div>
      )}

      {/* Purchases Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(purchase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{purchase.supplier?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {purchase.product?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{purchase.qty}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(purchase.purchase_price)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(purchase.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilters || search ? 'No purchases match your filters' : 'No purchases found'}
              </p>
              {(hasActiveFilters || search) && (
                <button
                  onClick={() => { resetFilters(); setSearch(''); }}
                  className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-lg p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Record Purchase</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Supplier</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Product</label>
                <select
                  value={form.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Record Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
