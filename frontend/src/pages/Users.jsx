import { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { PencilIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'staff', is_active: true })
  const { isAdmin, user: currentUser } = useAuth()

  useEffect(() => { if (isAdmin) loadUsers() }, [isAdmin])

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll()
      setUsers(res.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await usersAPI.update(editing.id, form)
      toast.success('User updated')
      loadUsers()
      setShowModal(false)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    }
  }

  const openModal = (user) => {
    setEditing(user)
    setForm({ full_name: user.full_name, email: user.email, role: user.role, is_active: user.is_active })
    setShowModal(true)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Access Required</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">You need admin privileges to access this page</p>
      </div>
    )
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system users and their roles</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {user.role === 'admin' ? <ShieldCheckIcon className="h-5 w-5 text-purple-600" /> : <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                        {user.id === currentUser?.id && <span className="text-xs text-primary-600">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(user)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" disabled={user.id === currentUser?.id}>
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Full Name</label><input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} className="input" required /></div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" required /></div>
              <div><label className="label">Role</label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
