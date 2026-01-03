import { useEffect, useState } from 'react'
import { productsAPI, categoriesAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    stock_qty: 0,
    min_stock_level: 10,
    cost_price: 0,
    sell_price: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        stock_qty: Number(form.stock_qty),
        min_stock_level: Number(form.min_stock_level),
        cost_price: Number(form.cost_price),
        sell_price: Number(form.sell_price),
      }

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload)
        toast.success('Product updated')
      } else {
        await productsAPI.create(payload)
        toast.success('Product created')
      }
      loadData()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product')
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setForm({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        category_id: product.category_id || '',
        stock_qty: product.stock_qty,
        min_stock_level: product.min_stock_level,
        cost_price: product.cost_price,
        sell_price: product.sell_price,
      })
    } else {
      setEditingProduct(null)
      setForm({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        stock_qty: 0,
        min_stock_level: 10,
        cost_price: 0,
        sell_price: 0,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your inventory products
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sell Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        {product.category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.sku || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock_qty <= product.min_stock_level
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}
                      >
                        {product.stock_qty}
                      </span>
                      {product.stock_qty <= product.min_stock_level && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(product.cost_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(product.sell_price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {(((product.sell_price - product.cost_price) / product.cost_price) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-lg p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Initial Stock</label>
                  <input
                    type="number"
                    value={form.stock_qty}
                    onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="label">Min Stock Level</label>
                  <input
                    type="number"
                    value={form.min_stock_level}
                    onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })}
                    className="input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="label">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Sell Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sell_price}
                    onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
