const BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  #token = null

  setToken(t) { this.#token = t }

  #getToken() {
    return this.#token || localStorage.getItem('zl_token')
  }

  #headers() {
    const h = { 'Content-Type': 'application/json' }
    const token = this.#getToken()
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }

  async #request(method, path, body, isFormData = false) {
    const token = this.#getToken()
    const opts = {
      method,
      headers: isFormData
        ? (token ? { Authorization: `Bearer ${token}` } : {})
        : this.#headers(),
    }
    if (body) opts.body = isFormData ? body : JSON.stringify(body)

    let res
    try {
      res = await fetch(`${BASE_URL}${path}`, opts)
    } catch {
      throw new Error(
        'Cannot reach the API server. Start the backend (uvicorn) and ensure VITE_API_URL points to it.'
      )
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      const detail = err.detail
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
        : detail || res.statusText || 'Request failed'
      throw new Error(msg)
    }
    return res.json()
  }

  get    = (path)           => this.#request('GET',    path)
  post   = (path, body)     => this.#request('POST',   path, body)
  put    = (path, body)     => this.#request('PUT',    path, body)
  delete = (path)           => this.#request('DELETE', path)
  upload = (path, formData) => this.#request('POST',   path, formData, true)
}

export const api = new ApiService()

// ── Restaurant helpers ────────────────────────────────────────────────────────
export const restaurantService = {
  getAll:       (params = {}) => api.get(`/restaurants?${new URLSearchParams(params)}`),
  getOne:       (id)          => api.get(`/restaurants/${id}`),
  getReviews:   (id, page=1)  => api.get(`/restaurants/${id}/reviews?page=${page}`),
  getTop:       (city)        => api.get(city ? `/restaurants/top?city=${encodeURIComponent(city)}` : '/restaurants/top'),
  getHiddenGems:(city)        => api.get(city ? `/restaurants/hidden-gems?city=${encodeURIComponent(city)}` : '/restaurants/hidden-gems'),
  getOverrated: (city)        => api.get(city ? `/restaurants/overrated?city=${encodeURIComponent(city)}` : '/restaurants/overrated'),
  getAreas:   () => api.get('/restaurants/areas'),
  getCities:  () => api.get('/restaurants/cities'),
  aiRecommend:(data) => api.post('/restaurants/ai-recommend', data),
  aiChat:     (data) => api.post('/restaurants/ai-chat', data),
}

// ── Admin helpers ─────────────────────────────────────────────────────────────
export const adminService = {
  getStats:           ()           => api.get('/admin/stats'),
  getRestaurants: (page = 1, search = '', sortBy = 'avg_rating', sortOrder = 'desc') => {
    const params = new URLSearchParams({ page, per_page: 10 })
    if (search) params.append('search', search)
    if (sortBy) params.append('sort_by', sortBy)
    if (sortOrder) params.append('sort_order', sortOrder)
    return api.get(`/admin/restaurants?${params.toString()}`)
  },
  createRestaurant:   (data)       => api.post('/admin/restaurants', data),
  updateRestaurant:   (id, data)   => api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant:   (id)         => api.delete(`/admin/restaurants/${id}`),
  uploadRestaurants:  (file)       => { const fd = new FormData(); fd.append('file', file); return api.upload('/admin/upload/restaurants', fd) },
  uploadReviews:      (file)       => { const fd = new FormData(); fd.append('file', file); return api.upload('/admin/upload/reviews', fd) },
  getUsers:           ()           => api.get('/admin/users'),
}

// ── Analysis helpers ──────────────────────────────────────────────────────────
export const analysisService = {
  run:       () => api.post('/analysis/run', {}),
  getStatus: () => api.get('/analysis/status'),
  getResults:() => api.get('/analysis/results'),
}
