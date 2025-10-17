import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalEvent, Task, ID } from './types'
import { deleteEvent, deleteTask, getAllEvents, getAllTasks, putEvent, putTask } from './data/db'

interface State {
  loaded: boolean
  tasks: Task[]
  events: CalEvent[]
  load: () => Promise<void>
  // tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>
  toggleTask: (id: ID) => Promise<void>
  removeTask: (id: ID) => Promise<void>
  // events
  addEvent: (e: Omit<CalEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalEvent>
  removeEvent: (id: ID) => Promise<void>
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      loaded: false,
      tasks: [],
      events: [],
      async load() {
        const [tasks, events] = await Promise.all([getAllTasks(), getAllEvents()])
        set({ tasks, events, loaded: true })
      },
      async addTask(t) {
        const now = Date.now()
        const task: Task = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, completedAt: null, ...t }
        await putTask(task)
        set({ tasks: [...get().tasks, task] })
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
    }),
    { name: 'tasks-ui-cache' }
  )
)
