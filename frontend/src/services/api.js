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
  getAll: () => api.get('/products'),
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
  getAll: () => api.get('/purchases'),
  getOne: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
}

// Sales
export const salesAPI = {
  getAll: () => api.get('/sales'),
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

// Export
export const exportAPI = {
  debts: () => api.get('/export/debts', { responseType: 'blob' }),
  sales: () => api.get('/export/sales', { responseType: 'blob' }),
  purchases: () => api.get('/export/purchases', { responseType: 'blob' }),
  inventory: () => api.get('/export/inventory', { responseType: 'blob' }),
}

export default api
