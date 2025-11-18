export interface MeetingRoom {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location: string;
  floor?: string;
  description?: string;
  equipment: Equipment[];
  images: Image[];
  status: RoomStatus;
  bookingRules?: BookingRules;
  minDuration?: number;
  maxDuration?: number;
  needApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  name: string;
  type: string;
  description?: string;
  available: boolean;
}

export interface Image {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface BookingRules {
  advanceBookingDays?: number;
  minAdvanceMinutes?: number;
  maxAdvanceMinutes?: number;
  allowedTimeSlots?: TimeSlot[];
  excludedDates?: string[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DISABLED';

export interface MeetingRoomListResponse {
  success: boolean;
  data: {
    list: MeetingRoom[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface MeetingRoomResponse {
  success: boolean;
  data: MeetingRoom;
}

export interface CreateMeetingRoomData {
  name: string;
  code: string;
  capacity: number;
  location: string;
  floor?: string;
  description?: string;
  equipment?: Equipment[];
  images?: Image[];
  bookingRules?: BookingRules;
  minDuration?: number;
  maxDuration?: number;
  needApproval?: boolean;
}

export interface UpdateMeetingRoomData extends Partial<CreateMeetingRoomData> {
  status?: RoomStatus;
}

export interface QueryMeetingRoomParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: RoomStatus;
  capacityMin?: number;
  capacityMax?: number;
}