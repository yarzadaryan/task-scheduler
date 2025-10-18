import { openDB, type IDBPDatabase } from 'idb'
import type { Task, CalEvent, DailyNote } from '../types'

export interface DBSchema {
  tasks: Task
  events: CalEvent
  notes: DailyNote
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('task-scheduler', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) {
          const store = db.createObjectStore('tasks', { keyPath: 'id' })
          store.createIndex('by_dueAt', 'dueAt')
          store.createIndex('by_completedAt', 'completedAt')
        }
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id' })
          store.createIndex('by_start', 'start')
        }
        if (!db.objectStoreNames.contains('notes')) {
          const store = db.createObjectStore('notes', { keyPath: 'id' })
          store.createIndex('by_date', 'date')
        }
      },
    })
  }
  return dbPromise
}

export async function putTask(t: Task) {
  const db = await getDB()
  await db.put('tasks', t)
}
export async function deleteTask(id: string) {
  const db = await getDB()
  await db.delete('tasks', id)
}
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB()
  return await db.getAll('tasks')
}

export async function putEvent(e: CalEvent) {
  const db = await getDB()
  await db.put('events', e)
}
export async function deleteEvent(id: string) {
  const db = await getDB()
  await db.delete('events', id)
}
export async function getAllEvents(): Promise<CalEvent[]> {
  const db = await getDB()
  return await db.getAll('events')
}

// Daily notes
export async function putNote(n: DailyNote) {
  const db = await getDB()
  await db.put('notes', n)
}
export async function getNoteByDate(dateStartMs: number): Promise<DailyNote | undefined> {
  const db = await getDB()
  const idx = db.transaction('notes').store.index('by_date')
  const range = IDBKeyRange.only(dateStartMs)
  const res = await idx.get(range)
  return res ?? undefined
}
