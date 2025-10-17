import { openDB, type IDBPDatabase } from 'idb'
import type { Task, CalEvent } from '../types'

export interface DBSchema {
  tasks: Task
  events: CalEvent
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('task-scheduler', 1, {
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
