const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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

    const res = await fetch(`${BASE_URL}${path}`, opts)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Request failed')
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
  getTop:       ()            => api.get('/restaurants/top'),
  getHiddenGems:()            => api.get('/restaurants/hidden-gems'),
  getOverrated: ()            => api.get('/restaurants/overrated'),
  getLocations: ()            => api.get('/restaurants/locations'),
}

// ── Admin helpers ─────────────────────────────────────────────────────────────
export const adminService = {
  getStats:           ()           => api.get('/admin/stats'),
  getRestaurants:     (page = 1)   => api.get(`/admin/restaurants?page=${page}&per_page=10`),
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
