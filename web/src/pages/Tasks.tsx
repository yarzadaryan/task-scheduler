import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useStore } from '../store'

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const [title, setTitle] = useState('')

  async function add() {
    const t = title.trim()
    if (!t) return
    await addTask({ title: t })
    setTitle('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className="w-full rounded-lg border border-black/10 bg-white/70 backdrop-blur px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-black/80 text-white px-3 py-2 hover:bg-black">
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </div>

      <ul className="divide-y divide-black/5 rounded-xl border border-black/5 bg-white/60 backdrop-blur">
        {tasks.length === 0 && (
          <li className="p-4 text-sm text-black/60">No tasks yet</li>
        )}
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between p-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!t.completedAt}
                onChange={() => toggleTask(t.id)}
                className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-500/30"
              />
              <span className={t.completedAt ? 'line-through text-black/50' : ''}>{t.title}</span>
            </label>
            <button onClick={() => removeTask(t.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
