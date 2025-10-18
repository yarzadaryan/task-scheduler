export type ID = string

export interface Task {
  id: ID
  title: string
  notes?: string
  dueAt?: number | null
  priority?: 'low' | 'med' | 'high'
  tags?: string[]
  completedAt?: number | null
  createdAt: number
  updatedAt: number
}

export interface CalEvent {
  id: ID
  title: string
  start: number // epoch ms
  end?: number | null
  allDay?: boolean
  createdAt: number
  updatedAt: number
}

export interface DailyNote {
  id: ID
  date: number // start of day epoch ms
  content: string
  createdAt: number
  updatedAt: number
}
