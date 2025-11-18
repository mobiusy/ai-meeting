import { create } from 'zustand';
import { MeetingRoom } from '@/types/meetingRoom';

interface MeetingRoomState {
  rooms: MeetingRoom[];
  loading: boolean;
  currentRoom: MeetingRoom | null;
  
  // Actions
  setRooms: (rooms: MeetingRoom[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentRoom: (room: MeetingRoom | null) => void;
  addRoom: (room: MeetingRoom) => void;
  updateRoom: (id: string, room: Partial<MeetingRoom>) => void;
  removeRoom: (id: string) => void;
}

export const useMeetingRoomStore = create<MeetingRoomState>((set) => ({
  rooms: [],
  loading: false,
  currentRoom: null,
  
  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ loading }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  
  addRoom: (room) => set((state) => ({ 
    rooms: [room, ...state.rooms] 
  })),
  
  updateRoom: (id, updatedRoom) => set((state) => ({
    rooms: state.rooms.map(room => 
      room.id === id ? { ...room, ...updatedRoom } : room
    ),
    currentRoom: state.currentRoom?.id === id 
      ? { ...state.currentRoom, ...updatedRoom } 
      : state.currentRoom
  })),
  
  removeRoom: (id) => set((state) => ({
    rooms: state.rooms.filter(room => room.id !== id),
    currentRoom: state.currentRoom?.id === id ? null : state.currentRoom
  })),
}));