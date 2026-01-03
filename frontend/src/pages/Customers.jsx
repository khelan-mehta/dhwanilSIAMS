import { useEffect, useState } from 'react'
import { customersAPI } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await customersAPI.getAll()
      setCustomers(res.data)
    } catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await customersAPI.update(editing.id, form)
        toast.success('Customer updated')
      } else {
        await customersAPI.create(form)
        toast.success('Customer created')
      }
      loadData()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save customer')
    }
  }

  const openModal = (customer = null) => {
    if (customer) {
      setEditing(customer)
      setForm({ name: customer.name, email: customer.email || '', phone: customer.phone || '', address: customer.address || '', notes: customer.notes || '' })
    } else {
      setEditing(null)
      setForm({ name: '', email: '', phone: '', address: '', notes: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer database</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add Customer
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div key={customer.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{customer.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                </div>
              </div>
              <button onClick={() => openModal(customer)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="h-4 w-4" /> {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-4 w-4" /> {customer.email}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No customers found</div>}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required /></div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" /></div>
              <div><label className="label">Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" /></div>
              <div><label className="label">Address</label><textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="input" rows="2" /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
