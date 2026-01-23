import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
}

// User management (admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
}

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
}

// Products
export const productsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.sku) queryParams.append('sku', params.sku)
    if (params.category_id) queryParams.append('category_id', params.category_id)
    if (params.low_stock) queryParams.append('low_stock', params.low_stock)
    const query = queryParams.toString()
    return api.get(`/products${query ? `?${query}` : ''}`)
  },
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  getLowStock: () => api.get('/products/alerts/low-stock'),
}

// Suppliers
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  getOne: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
}

// Customers
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
}

// Purchases
export const purchasesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id)
    if (params.product_id) queryParams.append('product_id', params.product_id)
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    const query = queryParams.toString()
    return api.get(`/purchases${query ? `?${query}` : ''}`)
  },
  getOne: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
}

// Sales
export const salesAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.customer_id) queryParams.append('customer_id', params.customer_id)
    if (params.payment_status) queryParams.append('payment_status', params.payment_status)
    const query = queryParams.toString()
    return api.get(`/sales${query ? `?${query}` : ''}`)
  },
  getOne: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
}

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  create: (data) => api.post('/payments', data),
}

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getFinance: () => api.get('/analytics/finance'),
  getDebts: () => api.get('/analytics/debts'),
  getSalesTrend: (days = 30) => api.get(`/analytics/sales-trend?days=${days}`),
  getTopProducts: (limit = 5) => api.get(`/analytics/top-products?limit=${limit}`),
}

// Returns
export const returnsAPI = {
  // Sales Returns
  createSalesReturn: (saleId, data) => api.post(`/sales/${saleId}/return`, data),
  getSalesReturns: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    const query = queryParams.toString()
    return api.get(`/returns/sales${query ? `?${query}` : ''}`)
  },
  getReturnsForSale: (saleId) => api.get(`/sales/${saleId}/returns`),
  getReturnableQtyForSale: (saleId) => api.get(`/sales/${saleId}/returnable-qty`),

  // Purchase Returns
  createPurchaseReturn: (purchaseId, data) => api.post(`/purchases/${purchaseId}/return`, data),
  getPurchaseReturns: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    const query = queryParams.toString()
    return api.get(`/returns/purchases${query ? `?${query}` : ''}`)
  },
  getReturnsForPurchase: (purchaseId) => api.get(`/purchases/${purchaseId}/returns`),
  getReturnableQtyForPurchase: (purchaseId) => api.get(`/purchases/${purchaseId}/returnable-qty`),

  // Summary
  getSummary: () => api.get('/returns/summary'),
}

// Export
export const exportAPI = {
  debts: () => api.get('/export/debts', { responseType: 'blob' }),
  sales: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.customer_id) queryParams.append('customer_id', params.customer_id)
    if (params.payment_status) queryParams.append('payment_status', params.payment_status)
    const query = queryParams.toString()
    return api.get(`/export/sales${query ? `?${query}` : ''}`, { responseType: 'blob' })
  },
  purchases: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.supplier_id) queryParams.append('supplier_id', params.supplier_id)
    if (params.product_id) queryParams.append('product_id', params.product_id)
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    const query = queryParams.toString()
    return api.get(`/export/purchases${query ? `?${query}` : ''}`, { responseType: 'blob' })
  },
  inventory: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.sku) queryParams.append('sku', params.sku)
    if (params.category_id) queryParams.append('category_id', params.category_id)
    if (params.low_stock) queryParams.append('low_stock', params.low_stock)
    const query = queryParams.toString()
    return api.get(`/export/inventory${query ? `?${query}` : ''}`, { responseType: 'blob' })
  },
}

export default api
