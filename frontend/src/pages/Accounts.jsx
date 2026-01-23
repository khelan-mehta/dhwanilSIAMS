import { useEffect, useState, useCallback } from 'react'
import { accountsAPI, statementsAPI, customersAPI, suppliersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  TruckIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
}

const AccountTypeIcon = ({ type }) => {
  switch (type) {
    case 'cash':
      return <BanknotesIcon className="h-5 w-5 text-green-600" />
    case 'bank':
      return <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
    case 'customer':
      return <UserGroupIcon className="h-5 w-5 text-purple-600" />
    case 'supplier':
      return <TruckIcon className="h-5 w-5 text-orange-600" />
    default:
      return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
  }
}

export default function Accounts() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [accounts, setAccounts] = useState([])
  const [summary, setSummary] = useState(null)
  const [customers, setCustomers] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')

  // Statement modal state
  const [showStatementModal, setShowStatementModal] = useState(false)
  const [statementType, setStatementType] = useState('customer')
  const [selectedId, setSelectedId] = useState('')
  const [statementData, setStatementData] = useState(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [statementDateRange, setStatementDateRange] = useState({ start: '', end: '' })

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferForm, setTransferForm] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    narration: '',
    transfer_date: new Date().toISOString().split('T')[0],
  })
  const [transferLoading, setTransferLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [accountsRes, summaryRes, customersRes, suppliersRes] = await Promise.all([
        accountsAPI.getAll(),
        accountsAPI.getSummary(),
        customersAPI.getAll(),
        suppliersAPI.getAll(),
      ])
      setAccounts(accountsRes.data)
      setSummary(summaryRes.data)
      setCustomers(customersRes.data)
      setSuppliers(suppliersRes.data)
    } catch (error) {
      toast.error('Failed to load accounts data')
    } finally {
      setLoading(false)
    }
  }

  const loadStatement = async () => {
    if (!selectedId) {
      toast.error('Please select a customer or supplier')
      return
    }
    setStatementLoading(true)
    try {
      const params = {}
      if (statementDateRange.start) params.start_date = statementDateRange.start
      if (statementDateRange.end) params.end_date = statementDateRange.end

      const res = statementType === 'customer'
        ? await statementsAPI.getCustomerStatement(selectedId, params)
        : await statementsAPI.getSupplierStatement(selectedId, params)
      setStatementData(res.data)
    } catch (error) {
      toast.error('Failed to load statement')
    } finally {
      setStatementLoading(false)
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!transferForm.from_account_id || !transferForm.to_account_id || !transferForm.amount) {
      toast.error('Please fill all required fields')
      return
    }
    setTransferLoading(true)
    try {
      await accountsAPI.transfer({
        ...transferForm,
        from_account_id: Number(transferForm.from_account_id),
        to_account_id: Number(transferForm.to_account_id),
        amount: Number(transferForm.amount),
      })
      toast.success('Transfer completed successfully')
      setShowTransferModal(false)
      setTransferForm({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        narration: '',
        transfer_date: new Date().toISOString().split('T')[0],
      })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Transfer failed')
    } finally {
      setTransferLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(a =>
    !accountTypeFilter || a.account_type === accountTypeFilter
  )

  const systemAccounts = accounts.filter(a => a.is_system)
  const customerAccounts = accounts.filter(a => a.account_type === 'customer')
  const supplierAccounts = accounts.filter(a => a.account_type === 'supplier')

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts & Ledger</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage accounts and view financial statements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStatementType('customer'); setSelectedId(''); setStatementData(null); setShowStatementModal(true) }}
            className="btn-secondary flex items-center gap-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            View Statement
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
              Transfer
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cash Balance</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.cash_balance)}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bank Balance</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.bank_balance)}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Receivables</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.total_receivables)}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payables</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.total_payables)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {['overview', 'customers', 'suppliers', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab} Accounts
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Accounts */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Accounts</h3>
            <div className="space-y-3">
              {systemAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AccountTypeIcon type={account.account_type} />
                    <span className="font-medium text-gray-900 dark:text-white">{account.name}</span>
                  </div>
                  <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customer Balances */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Customer Balances</h3>
            <div className="space-y-3">
              {customerAccounts
                .filter(a => a.balance > 0)
                .sort((a, b) => b.balance - a.balance)
                .slice(0, 5)
                .map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{account.name.replace('Customer: ', '')}</span>
                    </div>
                    <span className="font-semibold text-green-600">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              {customerAccounts.filter(a => a.balance > 0).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No outstanding customer balances</p>
              )}
            </div>
          </div>

          {/* Top Supplier Balances */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Supplier Balances</h3>
            <div className="space-y-3">
              {supplierAccounts
                .filter(a => a.balance !== 0)
                .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                .slice(0, 5)
                .map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TruckIcon className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{account.name.replace('Supplier: ', '')}</span>
                    </div>
                    <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              {supplierAccounts.filter(a => a.balance !== 0).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No supplier balances</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customerAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserGroupIcon className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{account.name.replace('Customer: ', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.balance > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {account.balance > 0 ? 'Owes' : 'Clear'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setStatementType('customer')
                          setSelectedId(account.reference_id)
                          setStatementData(null)
                          setShowStatementModal(true)
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View Statement
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customerAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No customer accounts found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {supplierAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TruckIcon className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{account.name.replace('Supplier: ', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.balance < 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {account.balance < 0 ? 'We Owe' : 'Clear'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setStatementType('supplier')
                          setSelectedId(account.reference_id)
                          setStatementData(null)
                          setShowStatementModal(true)
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View Statement
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {supplierAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No supplier accounts found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {systemAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AccountTypeIcon type={account.account_type} />
                        <span className="font-medium text-gray-900 dark:text-white">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                        {account.account_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {statementType === 'customer' ? 'Customer' : 'Supplier'} Statement
                </h2>
                <button
                  onClick={() => { setShowStatementModal(false); setStatementData(null) }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={statementType}
                    onChange={(e) => { setStatementType(e.target.value); setSelectedId(''); setStatementData(null) }}
                    className="input"
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="label">{statementType === 'customer' ? 'Customer' : 'Supplier'}</label>
                  <select
                    value={selectedId}
                    onChange={(e) => { setSelectedId(e.target.value); setStatementData(null) }}
                    className="input"
                  >
                    <option value="">Select...</option>
                    {(statementType === 'customer' ? customers : suppliers).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">From Date</label>
                  <input
                    type="date"
                    value={statementDateRange.start}
                    onChange={(e) => setStatementDateRange({ ...statementDateRange, start: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="label">To Date</label>
                    <input
                      type="date"
                      value={statementDateRange.end}
                      onChange={(e) => setStatementDateRange({ ...statementDateRange, end: e.target.value })}
                      className="input"
                    />
                  </div>
                  <button
                    onClick={loadStatement}
                    disabled={!selectedId || statementLoading}
                    className="btn-primary"
                  >
                    {statementLoading ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {statementData ? (
                <div className="space-y-4">
                  {/* Statement Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500">Total {statementType === 'customer' ? 'Sales' : 'Purchases'}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(statementData.total_sales || statementData.total_purchases)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Payments</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(statementData.total_payments)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Returns</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(statementData.total_returns)}
                      </p>
                    </div>
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-xs text-primary-600 dark:text-primary-400">Closing Balance</p>
                      <p className={`text-lg font-semibold ${statementData.closing_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(statementData.closing_balance)}
                      </p>
                    </div>
                  </div>

                  {/* Ledger Entries Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Narration</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debit</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Credit</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {statementData.entries && statementData.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {new Date(entry.entry_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 capitalize">
                                {entry.transaction_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                              {entry.narration}
                            </td>
                            <td className="px-4 py-3 text-right text-green-600">
                              {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right text-red-600">
                              {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(entry.balance_after)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!statementData.entries || statementData.entries.length === 0) && (
                      <div className="text-center py-8 text-gray-500">No entries found</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Select a {statementType} and click Load to view statement
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card w-full max-w-lg p-6 animate-slide-in">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Transfer</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="label">From Account</label>
                <select
                  value={transferForm.from_account_id}
                  onChange={(e) => setTransferForm({ ...transferForm, from_account_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">To Account</label>
                <select
                  value={transferForm.to_account_id}
                  onChange={(e) => setTransferForm({ ...transferForm, to_account_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.id !== Number(transferForm.from_account_id)).map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={transferForm.transfer_date}
                  onChange={(e) => setTransferForm({ ...transferForm, transfer_date: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Narration (optional)</label>
                <textarea
                  value={transferForm.narration}
                  onChange={(e) => setTransferForm({ ...transferForm, narration: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Reason for transfer..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowTransferModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={transferLoading}>
                  {transferLoading ? 'Processing...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
