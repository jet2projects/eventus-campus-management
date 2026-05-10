import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://eventus-campus-management-1.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(
      new Error(error.response?.data?.message || 'Something went wrong')
    )
  }
)

export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: data => api.put('/auth/me', data),
  changePassword: data => api.put('/auth/change-password', data),
}

export const eventsAPI = {
  getAll: params => api.get('/events', { params }),
  getFeatured: () => api.get('/events/featured'),
  getById: id => api.get(`/events/${id}`),
  getMyEvents: () => api.get('/events/my-events'),
  getAnalytics: id => api.get(`/events/${id}/analytics`),
  create: data => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: id => api.delete(`/events/${id}`),
}

export const bookingsAPI = {
  create: data => api.post('/bookings', data),
  getMy: params => api.get('/bookings/my', { params }),
  getById: id => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  getTicket: id => api.get(`/bookings/${id}/ticket`),
  checkIn: id => api.put(`/bookings/${id}/checkin`),
}

export const paymentsAPI = {
  createOrder: bookingId =>
    api.post('/payments/create-order', { bookingId }),
  verify: data => api.post('/payments/verify', data),
}

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: params => api.get('/admin/users', { params }),
  toggleUserStatus: id => api.put(`/admin/users/${id}/toggle`),
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }),
  getAllEvents: params => api.get('/admin/events', { params }),
  reviewEvent: (id, action, feedback) =>
    api.put(`/admin/events/${id}/review`, { action, feedback }),
  toggleFeatured: id => api.put(`/admin/events/${id}/feature`),
}

export const uploadAPI = {
  uploadImage: file => {
    const formData = new FormData()
    formData.append('image', file)

    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default api