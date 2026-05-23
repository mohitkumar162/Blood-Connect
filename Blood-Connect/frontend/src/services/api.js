import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

// Donors
export const donorApi = {
  getNearby: (params) => api.get('/api/donors/nearby', { params }),
  getAll: (params) => api.get('/api/donors', { params }),
  toggleAvailability: () => api.put('/api/donors/availability'),
  updateProfile: (data) => api.put('/api/donors/profile', data),
  getDonationHistory: () => api.get('/api/donors/history'),
}

// Blood Requests
export const requestApi = {
  create: (data) => api.post('/api/requests', data),
  getAll: (params) => api.get('/api/requests', { params }),
  getById: (id) => api.get(`/api/requests/${id}`),
  respond: (id, data) => api.post(`/api/requests/${id}/respond`, data),
  getMyRequests: () => api.get('/api/requests/mine'),
  getActive: () => api.get('/api/requests/active'),
  close: (id) => api.put(`/api/requests/${id}/close`),
}

// Admin
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  verifyDonor: (id) => api.put(`/api/admin/donors/${id}/verify`),
  getRequests: (params) => api.get('/api/admin/requests', { params }),
}

export default api
