import { useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useStore, DAILY_PRESETS } from '../store'

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const [title, setTitle] = useState('')

  const { todayPresets, otherTasks } = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + 24 * 60 * 60 * 1000 - 1

    const isToday = (ms?: number | null) => typeof ms === 'number' && ms >= start && ms <= end

    const presetSet = new Set<string>(DAILY_PRESETS as unknown as string[])
    const todays = tasks.filter((t) => presetSet.has(t.title) && isToday(t.dueAt ?? null))
    const others = tasks.filter((t) => !(presetSet.has(t.title) && isToday(t.dueAt ?? null)))
    return { todayPresets: todays, otherTasks: others }
  }, [tasks])

  async function add() {
    const t = title.trim()
    if (!t) return
    await addTask({ title: t })
    setTitle('')
  }

  const completedToday = todayPresets.filter((t) => !!t.completedAt).length
  const totalToday = todayPresets.length

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-black/60">Daily check-ins and everything else</p>
        </div>
        <div className="rounded-full bg-black/5 text-black/70 text-xs px-3 py-1">Today {completedToday}/{totalToday}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Today's Check-ins</h2>
              <span className="text-xs text-black/50">Auto-added</span>
            </div>
            <ul className="divide-y divide-black/5">
              {todayPresets.length === 0 && (
                <li className="p-3 text-sm text-black/60">No check-ins found for today</li>
              )}
              {todayPresets.map((t) => (
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
                  <button onClick={() => removeTask(t.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a task"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <button onClick={add} className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-4 py-2 hover:bg-black/90">
                <PlusIcon className="h-4 w-4" /> Add
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-2 shadow-sm">
            <ul className="divide-y divide-black/5">
              {otherTasks.length === 0 && (
                <li className="p-4 text-sm text-black/60">No tasks yet</li>
              )}
              {otherTasks.map((t) => (
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
                  <button onClick={() => removeTask(t.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
