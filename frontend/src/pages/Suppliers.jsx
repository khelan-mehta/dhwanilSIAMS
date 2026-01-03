import { useEffect, useState } from 'react'
import { suppliersAPI } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon, TruckIcon } from '@heroicons/react/24/outline'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await suppliersAPI.getAll()
      setSuppliers(res.data)
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await suppliersAPI.update(editing.id, form)
        toast.success('Supplier updated')
      } else {
        await suppliersAPI.create(form)
        toast.success('Supplier created')
      }
      loadData()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save supplier')
    }
  }

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditing(supplier)
      setForm({ name: supplier.name, email: supplier.email || '', phone: supplier.phone || '', address: supplier.address || '', notes: supplier.notes || '' })
    } else {
      setEditing(null)
      setForm({ name: '', email: '', phone: '', address: '', notes: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null) }

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search))

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your supplier network</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add Supplier
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((supplier) => (
          <div key={supplier.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <TruckIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                </div>
              </div>
              <button onClick={() => openModal(supplier)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="h-4 w-4" /> {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-4 w-4" /> {supplier.email}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No suppliers found</div>}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
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
