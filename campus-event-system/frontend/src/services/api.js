import axios from 'axios'
const api = axios.create({ baseURL:'/api', timeout:15000 })
api.interceptors.request.use(c => { const t=localStorage.getItem('token'); if(t) c.headers.Authorization=`Bearer ${t}`; return c })
api.interceptors.response.use(r=>r.data, e => { if(e.response?.status===401){localStorage.removeItem('token');localStorage.removeItem('user');if(!location.pathname.includes('/login'))location.href='/login'} return Promise.reject(new Error(e.response?.data?.message||'Error')) })
export const authAPI    = { register:d=>api.post('/auth/register',d), login:d=>api.post('/auth/login',d), getMe:()=>api.get('/auth/me'), updateProfile:d=>api.put('/auth/me',d), changePassword:d=>api.put('/auth/change-password',d) }
export const eventsAPI  = { getAll:p=>api.get('/events',{params:p}), getFeatured:()=>api.get('/events/featured'), getById:id=>api.get(`/events/${id}`), getMyEvents:()=>api.get('/events/my-events'), getAnalytics:id=>api.get(`/events/${id}/analytics`), create:d=>api.post('/events',d), update:(id,d)=>api.put(`/events/${id}`,d), delete:id=>api.delete(`/events/${id}`) }
export const bookingsAPI= { create:d=>api.post('/bookings',d), getMy:p=>api.get('/bookings/my',{params:p}), getById:id=>api.get(`/bookings/${id}`), cancel:(id,reason)=>api.put(`/bookings/${id}/cancel`,{reason}), getTicket:id=>api.get(`/bookings/${id}/ticket`), checkIn:id=>api.put(`/bookings/${id}/checkin`) }
export const paymentsAPI= { createOrder:b=>api.post('/payments/create-order',{bookingId:b}), verify:d=>api.post('/payments/verify',d) }
export const adminAPI   = { getAnalytics:()=>api.get('/admin/analytics'), getUsers:p=>api.get('/admin/users',{params:p}), toggleUserStatus:id=>api.put(`/admin/users/${id}/toggle`), updateUserRole:(id,role)=>api.put(`/admin/users/${id}/role`,{role}), getAllEvents:p=>api.get('/admin/events',{params:p}), reviewEvent:(id,action,feedback)=>api.put(`/admin/events/${id}/review`,{action,feedback}), toggleFeatured:id=>api.put(`/admin/events/${id}/feature`) }
export const uploadAPI  = { uploadImage:f=>{const fd=new FormData();fd.append('image',f);return api.post('/upload/image',fd,{headers:{'Content-Type':'multipart/form-data'}})} }
export default api
