import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              SIAMS
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Smart Inventory & Accounts Management
            </p>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Manage Your Inventory Smarter
          </h2>
          <p className="text-lg text-primary-100">
            Track products, manage customers, monitor debts, and generate reports
            all in one powerful platform.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-sm text-primary-200">
                Get instant insights into your business performance
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Debt Tracking</h3>
              <p className="text-sm text-primary-200">
                Never lose track of who owes you money
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Export Reports</h3>
              <p className="text-sm text-primary-200">
                Download detailed Excel reports anytime
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">User Management</h3>
              <p className="text-sm text-primary-200">
                Control access with role-based permissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
