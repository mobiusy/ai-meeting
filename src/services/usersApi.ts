import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      if (parsed.state?.token) {
        ;(config.headers as any).Authorization = `Bearer ${parsed.state.token}`
      }
    } catch {}
  }
  return config
})

export const usersApi = {
  async getList(): Promise<{ success: boolean; data: any[] }> {
    const resp = await api.get('/users')
    const body = resp.data
    if (body?.data) return { success: true, data: body.data }
    return { success: true, data: body }
  },
}
