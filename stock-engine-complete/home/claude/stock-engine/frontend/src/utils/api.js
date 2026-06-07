import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

export const marketApi = {
  getAllTicks:  () => api.get('/market/ticks'),
  getTick:     (sym) => api.get(`/market/ticks/${sym}`),
  getTrades:   (sym, page=0) => api.get(`/market/trades/${sym}?page=${page}&size=20`),
  getStats:    () => api.get('/market/stats'),
  getByThread: () => api.get('/market/trades/threads'),
}

export const orderApi = {
  place:       (data) => api.post('/orders', data),
  cancel:      (id, clientId) => api.delete(`/orders/${id}?clientId=${clientId}`),
  getOrders:   (clientId, page=0) => api.get(`/orders?clientId=${clientId}&page=${page}&size=20`),
  getOpen:     (clientId) => api.get(`/orders/open?clientId=${clientId}`),
  engineStats: () => api.get('/orders/engine/stats'),
  orderBook:   (sym) => api.get(`/orders/engine/book/${sym}`),
}

export const accountApi = {
  getAll:      () => api.get('/accounts'),
  getOne:      (clientId) => api.get(`/accounts/${clientId}`),
  getPositions:(clientId) => api.get(`/accounts/${clientId}/positions`),
  getPortfolio:(clientId) => api.get(`/accounts/${clientId}/portfolio`),
  getTrades:   (clientId) => api.get(`/accounts/${clientId}/trades`),
}

export default api