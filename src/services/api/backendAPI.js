import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken
          })
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('refresh_token', response.data.refresh_token)
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.access_token}`
          return api.request(error.config)
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

// Saved Papers API
export const savedPapersAPI = {
  getAll: async () => {
    const response = await api.get('/saved/')
    return response.data
  },

  save: async (paper) => {
    const response = await api.post('/saved/', {
      arxiv_id: paper.id || paper.arxiv_id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      published_date: paper.publishedDate || paper.published_date,
      pdf_url: paper.pdfUrl || paper.pdf_url,
      source_url: paper.sourceUrl || paper.source_url,
      notes: paper.notes || null,
      is_public: true
    })
    return response.data
  },

  update: async (paperId, updates) => {
    const response = await api.patch(`/saved/${paperId}`, updates)
    return response.data
  },

  remove: async (paperId) => {
    await api.delete(`/saved/${paperId}`)
  },

  export: async (format, tag = null) => {
    const params = { format }
    if (tag) params.tag = tag
    const response = await api.get('/saved/export', { params, responseType: 'blob' })
    return response.data
  }
}

// Tags API
export const tagsAPI = {
  getAll: async () => {
    const response = await api.get('/saved/tags')
    return response.data
  },

  create: async (name, color = '#9333EA') => {
    const response = await api.post('/saved/tags', { name, color })
    return response.data
  },

  delete: async (tagId) => {
    await api.delete(`/saved/tags/${tagId}`)
  }
}

export default api
