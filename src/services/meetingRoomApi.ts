import axios from 'axios';
import { 
  MeetingRoomListResponse, 
  MeetingRoomResponse, 
  CreateMeetingRoomData, 
  UpdateMeetingRoomData, 
  QueryMeetingRoomParams 
} from '@/types/meetingRoom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从zustand的localStorage存储中获取token
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (error) {
        console.error('解析认证数据失败:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除zustand存储的认证数据
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const meetingRoomApi = {
  // 获取会议室列表
  async getList(params: QueryMeetingRoomParams = {}): Promise<MeetingRoomListResponse> {
    const response = await api.get('/meeting-rooms', { params });
    return response.data;
  },

  // 获取会议室详情
  async getById(id: string): Promise<MeetingRoomResponse> {
    const response = await api.get(`/meeting-rooms/${id}`);
    return response.data;
  },

  // 创建会议室
  async create(data: CreateMeetingRoomData): Promise<MeetingRoomResponse> {
    const response = await api.post('/meeting-rooms', data);
    return response.data;
  },

  // 更新会议室
  async update(id: string, data: UpdateMeetingRoomData): Promise<MeetingRoomResponse> {
    const response = await api.patch(`/meeting-rooms/${id}`, data);
    return response.data;
  },

  // 删除会议室
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/meeting-rooms/${id}`);
    return response.data;
  },

  // 更新会议室状态
  async updateStatus(id: string, status: string): Promise<MeetingRoomResponse> {
    const response = await api.patch(`/meeting-rooms/${id}/status`, { status });
    return response.data;
  },
};