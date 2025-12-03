import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Meeting } from '@/types/meeting'

interface MeetingState {
  meetings: Meeting[]
  current?: Meeting
  loading: boolean
  setMeetings: (list: Meeting[]) => void
  setCurrent: (m?: Meeting) => void
  setLoading: (v: boolean) => void
  removeMeeting: (id: string) => void
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set) => ({
      meetings: [],
      current: undefined,
      loading: false,
      setMeetings: (list) => set({ meetings: list }),
      setCurrent: (m) => set({ current: m }),
      setLoading: (v) => set({ loading: v }),
      removeMeeting: (id) => set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),
    }),
    { name: 'meeting-storage', partialize: (s) => ({ meetings: s.meetings }) }
  )
)
