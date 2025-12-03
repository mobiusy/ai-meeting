export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MeetingParticipant {
  userId: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: MeetingStatus
  roomId: string
  creatorId: string
  participants: MeetingParticipant[]
  room?: { id: string; name: string; capacity?: number }
  approvals?: Array<{ id: string; action: 'APPROVED' | 'REJECTED'; reason?: string; approverId: string; createdAt: string }>
  createdAt?: string
  updatedAt?: string
}

export interface CreateMeetingData {
  title: string
  description?: string
  startTime: string
  endTime: string
  roomId: string
  participants?: string[]
}

export interface UpdateMeetingData {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  roomId?: string
  participants?: string[]
}

export interface QueryMeetingParams {
  keyword?: string
  status?: MeetingStatus
  roomId?: string
  creatorId?: string
  page?: number
  pageSize?: number
  startFrom?: string
  endTo?: string
}

export interface MeetingListResponse {
  success: boolean
  data: { list: Meeting[]; total: number; page: number; pageSize: number }
}

export interface MeetingResponse {
  success: boolean
  data: Meeting
}
