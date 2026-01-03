import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, categoriesAPI } from '../services/api'
import toast from 'react-hot-toast'
import { UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function Settings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateMe(profileForm)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await categoriesAPI.create(categoryForm)
      toast.success('Category created')
      setCategoryForm({ name: '', description: '' })
      setShowCategoryModal(false)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create category')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <UserCircleIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your account information</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Role: <span className="font-medium text-gray-900 dark:text-white">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
              </p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Product Categories */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organize your products into categories</p>
          </div>
          <button onClick={() => setShowCategoryModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-5 w-5" /> Add Category
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Application</span>
            <span className="font-medium text-gray-900 dark:text-white">SIAMS v2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Backend</span>
            <span className="font-medium text-gray-900 dark:text-white">FastAPI + SQLite</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400">Frontend</span>
            <span className="font-medium text-gray-900 dark:text-white">React + Tailwind CSS</span>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-md p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="label">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
