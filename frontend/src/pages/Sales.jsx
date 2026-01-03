import { useEffect, useState } from 'react'
import { salesAPI, productsAPI, customersAPI } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function Sales() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    customer_id: '',
    product_id: '',
    qty: 1,
    selling_price: 0,
    paid_amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [salesRes, productsRes, customersRes] = await Promise.all([
        salesAPI.getAll(),
        productsAPI.getAll(),
        customersAPI.getAll(),
      ])
      setSales(salesRes.data)
      setProducts(productsRes.data)
      setCustomers(customersRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === Number(productId))
    setForm({
      ...form,
      product_id: productId,
      selling_price: product?.sell_price || 0,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await salesAPI.create({
        ...form,
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        qty: Number(form.qty),
        selling_price: Number(form.selling_price),
        paid_amount: Number(form.paid_amount),
      })
      toast.success('Sale recorded successfully')
      loadData()
      setShowModal(false)
      setForm({
        customer_id: '',
        product_id: '',
        qty: 1,
        selling_price: 0,
        paid_amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record sale')
    }
  }

  const totalAmount = Number(form.qty) * Number(form.selling_price)
  const outstanding = totalAmount - Number(form.paid_amount)

  const filteredSales = sales.filter((s) =>
    s.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.product?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Record and manage sales transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          New Sale
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{sale.customer?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {sale.product?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{sale.qty}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(sale.paid_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.is_fully_paid
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {sale.is_fully_paid ? 'Paid' : `Owes ${formatCurrency(sale.total_amount - sale.paid_amount)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(sale.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-gray-500">No sales found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-lg p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Record Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Customer</label>
                <select
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_qty})</option>
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
                  <label className="label">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                </div>
                <div>
                  <label className="label">Amount Paid</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.paid_amount}
                    onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                    className="input"
                    max={totalAmount}
                  />
                </div>
                {outstanding > 0 && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    Outstanding: {formatCurrency(outstanding)}
                  </p>
                )}
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

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Record Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
