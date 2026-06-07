import axios from 'axios'
const api = axios.create({ baseURL: '/api', timeout: 15000 })

export const triageApi = {
  admit:       (data)     => api.post('/triage/admit', data),
  getActive:   ()         => api.get('/triage/admissions'),
  getAdm:      (id)       => api.get(`/triage/admissions/${id}`),
  getVitals:   (id)       => api.get(`/triage/admissions/${id}/vitals`),
  getLabs:     (id)       => api.get(`/triage/admissions/${id}/labs`),
  orderLabs:   (data)     => api.post('/triage/labs/order', data),
  queueStats:  ()         => api.get('/triage/queue/stats'),
  statusSummary: ()       => api.get('/triage/status-summary'),
}
export const bedApi = {
  getStats:    ()         => api.get('/beds/stats'),
  getAvailable:(ward)     => api.get(`/beds/available${ward?'?ward='+ward:''}`),
  getAllBeds:   ()         => api.get('/beds'),
  releaseBed:  (id)       => api.post(`/beds/${id}/release`),
  wardSummary: ()         => api.get('/beds/ward-summary'),
}
export const alertApi = {
  getRecent:   ()         => api.get('/alerts/recent'),
  getUnacked:  (page=0)   => api.get(`/alerts/unacknowledged?page=${page}`),
  acknowledge: (id, by)   => api.post(`/alerts/${id}/acknowledge?by=${by}`),
  getStats:    ()         => api.get('/alerts/stats'),
}
export const dashApi = {
  getSummary:  ()         => api.get('/dashboard/summary'),
  getDoctors:  ()         => api.get('/dashboard/doctors'),
}
export default api