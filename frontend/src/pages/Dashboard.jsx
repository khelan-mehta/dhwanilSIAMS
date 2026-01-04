import { useEffect, useState } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { analyticsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  TruckIcon,
  CubeIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function StatCard({ title, value, icon: Icon, color, subtext }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtext && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const badges = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    staff: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${badges[role] || badges.staff}`}>
      {role} Dashboard
    </span>
  )
}

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, padding: 20 },
    },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
    x: { grid: { display: false } },
  },
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ data }) {
  const financial = data?.financial || {}
  const userStats = data?.user_stats || {}
  const salesTrend = data?.sales_trend || []
  const topProducts = data?.top_products || []
  const customerDebts = data?.customer_debts || []
  const lowStockProducts = data?.low_stock_products || []
  const recentSales = data?.recent_sales || []

  const salesChartData = {
    labels: salesTrend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue',
        data: salesTrend.map(item => item.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: salesTrend.map(item => item.profit),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const productsChartData = {
    labels: topProducts.map(p => p.product_name),
    datasets: [{
      label: 'Revenue',
      data: topProducts.map(p => p.revenue),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderRadius: 8,
    }],
  }

  const debtChartData = {
    labels: customerDebts.slice(0, 5).map(d => d.customer_name),
    datasets: [{
      data: customerDebts.slice(0, 5).map(d => d.total_owed),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderWidth: 0,
    }],
  }

  return (
    <>
      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(financial.total_revenue)} icon={CurrencyDollarIcon} color="green" />
        <StatCard title="Total Expenses" value={formatCurrency(financial.total_expenses)} icon={ShoppingBagIcon} color="red" />
        <StatCard title="Outstanding" value={formatCurrency(financial.outstanding_receivables)} icon={BanknotesIcon} color="yellow" subtext={`From ${customerDebts.length} customers`} />
        <StatCard title="Net Profit" value={formatCurrency(financial.net_profit)} icon={ArrowTrendingUpIcon} color="blue" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={financial.total_products || 0} icon={CubeIcon} color="indigo" />
        <StatCard title="Low Stock Items" value={financial.low_stock_count || 0} icon={ExclamationTriangleIcon} color="red" />
        <StatCard title="Total Users" value={userStats.total_users || 0} icon={UsersIcon} color="purple" subtext={`${userStats.admin_count || 0} Admin, ${userStats.manager_count || 0} Manager, ${userStats.staff_count || 0} Staff`} />
        <StatCard title="Suppliers" value={financial.total_suppliers || 0} icon={TruckIcon} color="cyan" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend (Last 30 Days)</h3>
          <div className="h-72">
            {salesTrend.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No sales data available</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products by Revenue</h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <Bar data={productsChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No product data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Debtors</h3>
          <div className="h-64">
            {customerDebts.length > 0 ? (
              <Doughnut data={debtChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } } }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No outstanding debts</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min: {product.min_stock_level}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                    {product.stock_qty} left
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">All products well stocked</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sales</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sale.customer?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{sale.product?.name || 'Product'} x{sale.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(sale.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.is_fully_paid ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'}`}>
                      {sale.is_fully_paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">No recent sales</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== MANAGER DASHBOARD ====================
function ManagerDashboard({ data }) {
  const summary = data?.summary || {}
  const inventory = data?.inventory || {}
  const salesTrend = data?.sales_trend || []
  const topProducts = data?.top_products || []
  const customerDebts = data?.customer_debts || []
  const lowStockProducts = data?.low_stock_products || []

  const salesChartData = {
    labels: salesTrend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue',
        data: salesTrend.map(item => item.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const productsChartData = {
    labels: topProducts.slice(0, 5).map(p => p.product_name),
    datasets: [{
      label: 'Units Sold',
      data: topProducts.slice(0, 5).map(p => p.total_sold),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderRadius: 8,
    }],
  }

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={summary.total_sales || 0} icon={ShoppingCartIcon} color="blue" />
        <StatCard title="Outstanding Payments" value={formatCurrency(summary.outstanding_payments)} icon={BanknotesIcon} color="yellow" />
        <StatCard title="Low Stock Items" value={summary.low_stock_count || 0} icon={ExclamationTriangleIcon} color="red" />
        <StatCard title="Inventory Value" value={formatCurrency(inventory.total_sell_value)} icon={CubeIcon} color="green" subtext={`Cost: ${formatCurrency(inventory.total_cost_value)}`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend (Last 30 Days)</h3>
          <div className="h-72">
            {salesTrend.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No sales data available</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <Bar data={productsChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No product data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min Level: {product.min_stock_level}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                    {product.stock_qty} left
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">All products well stocked</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Payments</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {customerDebts.length > 0 ? (
              customerDebts.slice(0, 8).map((debt, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{debt.customer_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{debt.sales_count} unpaid sales</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                    {formatCurrency(debt.total_owed)}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">No pending payments</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== STAFF DASHBOARD ====================
function StaffDashboard({ data }) {
  const todaySummary = data?.today_summary || {}
  const lowStockProducts = data?.low_stock_products || []
  const recentActivity = data?.recent_activity || []

  return (
    <>
      {/* Today's Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Today's Sales" value={todaySummary.sales_count || 0} icon={ShoppingCartIcon} color="blue" />
        <StatCard title="Items Sold Today" value={todaySummary.total_items || 0} icon={CubeIcon} color="green" />
        <StatCard title="Today's Revenue" value={formatCurrency(todaySummary.total_amount)} icon={CurrencyDollarIcon} color="purple" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Minimum required: {product.min_stock_level} units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 text-sm font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                      {product.stock_qty} left
                    </span>
                    {product.stock_qty === 0 && (
                      <p className="text-xs text-red-600 mt-1 font-medium">OUT OF STOCK</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <CubeIcon className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium">All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" />
            Today's Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sale.customer?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sale.product?.name || 'Product'} x {sale.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(sale.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.is_fully_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {sale.is_fully_paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mb-3" />
                <p className="font-medium">No sales recorded today</p>
                <p className="text-sm mt-1">Start making sales!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Info */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border border-primary-100 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Tips</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Check low stock alerts regularly and notify your manager</li>
          <li>• Record all sales promptly for accurate inventory tracking</li>
          <li>• Verify product availability before confirming customer orders</li>
        </ul>
      </div>
    </>
  )
}

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard()
      setData(response.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  const role = data?.role || user?.role || 'staff'

  const getWelcomeMessage = () => {
    switch (role) {
      case 'admin':
        return "Here's a complete overview of your business operations."
      case 'manager':
        return "Monitor sales performance and inventory status."
      default:
        return "Track your daily activities and stock alerts."
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {user?.full_name || 'User'}! {getWelcomeMessage()}
          </p>
        </div>
      </div>

      {/* Role-Specific Dashboard Content */}
      {role === 'admin' && <AdminDashboard data={data} />}
      {role === 'manager' && <ManagerDashboard data={data} />}
      {role === 'staff' && <StaffDashboard data={data} />}
    </div>
  )
}
