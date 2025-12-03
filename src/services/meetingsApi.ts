import axios from 'axios'
import { MeetingListResponse, MeetingResponse, CreateMeetingData, UpdateMeetingData, QueryMeetingParams } from '@/types/meeting'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const meetingsApi = {
  async getList(params: QueryMeetingParams = {}): Promise<MeetingListResponse> {
    const mapped: any = { ...params }
    if ((params as any).startFrom) mapped.startFrom = (params as any).startFrom
    if ((params as any).endTo) mapped.endTo = (params as any).endTo
    if (params.pageSize) mapped.limit = params.pageSize
    delete mapped.pageSize
    const response = await api.get('/meetings', { params: mapped })
    const payload = response.data
    return { success: true, data: { list: payload.data ?? [], total: payload.total ?? 0, page: payload.page ?? 1, pageSize: payload.limit ?? params.pageSize ?? 10 } }
  },
  async getById(id: string): Promise<MeetingResponse> {
    const response = await api.get(`/meetings/${id}`)
    return { success: true, data: response.data }
  },
  async create(data: CreateMeetingData): Promise<{ success: boolean; data: any }> {
    const response = await api.post('/meetings', data)
    return { success: true, data: response.data }
  },
  async update(id: string, data: UpdateMeetingData): Promise<MeetingResponse> {
    const response = await api.patch(`/meetings/${id}`, data)
    return { success: true, data: response.data }
  },
  async cancel(id: string): Promise<MeetingResponse> {
    const response = await api.post(`/meetings/${id}/cancel`)
    return { success: true, data: response.data }
  },
  async getAvailability(startTime: string, endTime: string, capacity?: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/meetings/availability', { params: { startTime, endTime, capacity } })
    return { success: true, data: response.data }
  },
  async approve(id: string): Promise<MeetingResponse> {
    const response = await api.post(`/meetings/${id}/approve`)
    return { success: true, data: response.data }
  },
  async reject(id: string, reason?: string): Promise<MeetingResponse> {
    const response = await api.post(`/meetings/${id}/reject`, { reason })
    return { success: true, data: response.data }
  },
}
