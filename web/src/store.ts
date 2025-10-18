import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalEvent, Task, ID } from './types'
import { deleteEvent, deleteTask, getAllEvents, getAllTasks, putEvent, putTask, getNoteByDate, putNote, getAllNotes, deleteNote } from './data/db'
import type { DailyNote } from './types'

const DEFAULT_PRESETS = ['Pray', 'Gym', 'Eat'] as const

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

interface State {
  loaded: boolean
  tasks: Task[]
  events: CalEvent[]
  presets: string[]
  todayNote: DailyNote | null
  notes: DailyNote[]
  load: () => Promise<void>
  // tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>
  toggleTask: (id: ID) => Promise<void>
  removeTask: (id: ID) => Promise<void>
  // events
  addEvent: (e: Omit<CalEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalEvent>
  removeEvent: (id: ID) => Promise<void>
  updateEvent: (id: ID, patch: Partial<CalEvent>) => Promise<void>
  // presets
  addPreset: (title: string) => void
  removePreset: (title: string) => void
  reorderPresets: (from: number, to: number) => void
  // daily note
  loadTodayNote: () => Promise<void>
  saveTodayNote: (content: string) => Promise<void>
  loadNotes: () => Promise<void>
  loadNoteByDate: (dateStartMs: number) => Promise<void>
  saveNoteForDate: (dateStartMs: number, content: string) => Promise<void>
  deleteNoteById: (id: string) => Promise<void>
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      loaded: false,
      tasks: [],
      events: [],
      presets: [...DEFAULT_PRESETS],
      todayNote: null,
      notes: [],
      async load() {
        const [tasks, events] = await Promise.all([getAllTasks(), getAllEvents()])
        set({ tasks, events, loaded: true })
        const s = startOfToday()
        const e = endOfToday()
        for (const title of get().presets) {
          const exists = get().tasks.some((t) => t.title === title && (t.dueAt ?? 0) >= s && (t.dueAt ?? 0) <= e)
          if (!exists) {
            await get().addTask({ title, dueAt: s })
          }
        }
      },
      async addTask(t) {
        const now = Date.now()
        const task: Task = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, completedAt: null, ...t }
        await putTask(task)
        set({ tasks: [...get().tasks, task] })
        // Also add to calendar as all-day event on due date (default: today)
        const due = task.dueAt ?? startOfToday()
        await get().addEvent({ title: task.title, start: due, allDay: true })
        return task
      },
      async toggleTask(id) {
        const current = get().tasks.find((x) => x.id === id)
        if (!current) return
        const updated: Task = {
          ...current,
          completedAt: current.completedAt ? null : Date.now(),
          updatedAt: Date.now(),
        }
        await putTask(updated)
        set({ tasks: get().tasks.map((x) => (x.id === id ? updated : x)) })
        // Try to find matching calendar event (same title, same start-of-day as due date)
        const due = (updated.dueAt ?? startOfToday())
        const s = new Date(due)
        s.setHours(0,0,0,0)
        const targetStart = s.getTime()
        const ev = get().events.find((e) => e.title.replace(/\s*✅$/, '') === updated.title && (e.start >= targetStart && e.start < targetStart + 24*60*60*1000))
        if (ev) {
          const already = /✅$/.test(ev.title)
          const newTitle = updated.completedAt && !already ? `${ev.title} ✅` : (!updated.completedAt && already ? ev.title.replace(/\s*✅$/, '') : ev.title)
          await get().updateEvent(ev.id, { title: newTitle })
        }
      },
      async removeTask(id) {
        await deleteTask(id)
        set({ tasks: get().tasks.filter((x) => x.id !== id) })
      },
      async addEvent(e) {
        const now = Date.now()
        const evt: CalEvent = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...e }
        await putEvent(evt)
        set({ events: [...get().events, evt] })
        return evt
      },
      async removeEvent(id) {
        await deleteEvent(id)
        set({ events: get().events.filter((x) => x.id !== id) })
      },
      async updateEvent(id, patch) {
        const current = get().events.find((e) => e.id === id)
        if (!current) return
        const updated: CalEvent = { ...current, ...patch, updatedAt: Date.now() }
        await putEvent(updated)
        set({ events: get().events.map((e) => (e.id === id ? updated : e)) })
      },
      addPreset(title) {
        const t = title.trim()
        if (!t) return
        if (get().presets.includes(t)) return
        set({ presets: [...get().presets, t] })
      },
      removePreset(title) {
        set({ presets: get().presets.filter((p) => p !== title) })
      },
      reorderPresets(from, to) {
        const arr = [...get().presets]
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        set({ presets: arr })
      },
      async loadTodayNote() {
        const s = startOfToday()
        const existing = await getNoteByDate(s)
        set({ todayNote: existing ?? null })
      },
      async saveTodayNote(content: string) {
        const s = startOfToday()
        const now = Date.now()
        const current = get().todayNote
        const note: DailyNote = current
          ? { ...current, content, updatedAt: now }
          : { id: crypto.randomUUID(), date: s, content, createdAt: now, updatedAt: now }
        await putNote(note)
        set({ todayNote: note })
      },
      async loadNotes() {
        const all = await getAllNotes()
        set({ notes: all })
      },
      async loadNoteByDate(dateStartMs: number) {
        const existing = await getNoteByDate(dateStartMs)
        set({ todayNote: existing ?? null })
      },
      async saveNoteForDate(dateStartMs: number, content: string) {
        const now = Date.now()
        const existing = await getNoteByDate(dateStartMs)
        const note: DailyNote = existing
          ? { ...existing, content, updatedAt: now }
          : { id: crypto.randomUUID(), date: dateStartMs, content, createdAt: now, updatedAt: now }
        await putNote(note)
        set({ todayNote: note })
      },
      async deleteNoteById(id: string) {
        await deleteNote(id)
        const remaining = get().notes.filter((n) => n.id !== id)
        set({ notes: remaining, todayNote: get().todayNote?.id === id ? null : get().todayNote })
      },
    }),
    { name: 'tasks-ui-cache' }
  )
)
