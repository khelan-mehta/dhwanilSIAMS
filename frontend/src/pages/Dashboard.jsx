import { useEffect, useState } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { analyticsAPI } from '../services/api'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  TruckIcon,
  CubeIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function StatCard({ title, value, icon: Icon, color, subtext }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
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

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const financial = data?.financial || {}
  const salesTrend = data?.sales_trend || []
  const topProducts = data?.top_products || []
  const customerDebts = data?.customer_debts || []
  const lowStockProducts = data?.low_stock_products || []
  const recentSales = data?.recent_sales || []

  // Sales trend chart data
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

  // Top products chart data
  const productsChartData = {
    labels: topProducts.map(p => p.product_name),
    datasets: [
      {
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
      },
    ],
  }

  // Debt distribution chart
  const debtChartData = {
    labels: customerDebts.slice(0, 5).map(d => d.customer_name),
    datasets: [
      {
        data: customerDebts.slice(0, 5).map(d => d.total_owed),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(financial.total_revenue || 0)}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financial.total_expenses || 0)}
          icon={ShoppingBagIcon}
          color="red"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(financial.outstanding_receivables || 0)}
          icon={BanknotesIcon}
          color="yellow"
          subtext={`From ${customerDebts.length} customers`}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(financial.net_profit || 0)}
          icon={ArrowTrendingUpIcon}
          color="blue"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={financial.total_products || 0}
          icon={CubeIcon}
          color="indigo"
        />
        <StatCard
          title="Low Stock Items"
          value={financial.low_stock_count || 0}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatCard
          title="Customers"
          value={financial.total_customers || 0}
          icon={UsersIcon}
          color="purple"
        />
        <StatCard
          title="Suppliers"
          value={financial.total_suppliers || 0}
          icon={TruckIcon}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales Trend (Last 30 Days)
          </h3>
          <div className="h-72">
            {salesTrend.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Products by Revenue
          </h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <Bar data={productsChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debt Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Debtors
          </h3>
          <div className="h-64">
            {customerDebts.length > 0 ? (
              <Doughnut
                data={debtChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No outstanding debts
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Low Stock Alerts
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Min: {product.min_stock_level}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                    {product.stock_qty} left
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">
                All products well stocked
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sales
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sale.customer?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sale.product?.name || 'Product'} x{sale.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(sale.total_amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        sale.is_fully_paid
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {sale.is_fully_paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 py-8">
                No recent sales
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
