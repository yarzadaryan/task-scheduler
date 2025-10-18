import { useEffect, useMemo, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useStore } from '../store'
import { useToast } from '../ui/toast'

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const presets = useStore((s) => s.presets)
  const addPreset = useStore((s) => s.addPreset)
  const removePreset = useStore((s) => s.removePreset)
  const [title, setTitle] = useState('')
  const [newPreset, setNewPreset] = useState('')
  const { toast } = useToast()
  const todayNote = useStore((s) => s.todayNote)
  const notes = useStore((s) => s.notes)
  const loadNotes = useStore((s) => s.loadNotes)
  const loadNoteByDate = useStore((s) => s.loadNoteByDate)
  const saveNoteForDate = useStore((s) => s.saveNoteForDate)
  const [noteContent, setNoteContent] = useState('')
  const [selectedDate, setSelectedDate] = useState<number>(() => {
    const d = new Date()
    d.setHours(0,0,0,0)
    return d.getTime()
  })

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  useEffect(() => {
    // load note for the currently selected date
    loadNoteByDate(selectedDate)
  }, [selectedDate, loadNoteByDate])

  useEffect(() => {
    setNoteContent(todayNote?.content ?? '')
  }, [todayNote])

  const { todayPresets, otherTasks } = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + 24 * 60 * 60 * 1000 - 1

    const isToday = (ms?: number | null) => typeof ms === 'number' && ms >= start && ms <= end

    const presetSet = new Set<string>(presets)
    const todays = tasks.filter((t) => presetSet.has(t.title) && isToday(t.dueAt ?? null))
    const others = tasks.filter((t) => !(presetSet.has(t.title) && isToday(t.dueAt ?? null)))
    return { todayPresets: todays, otherTasks: others }
  }, [tasks, presets])

  function dayStart(ts: number) {
    const d = new Date(ts)
    d.setHours(0,0,0,0)
    return d.getTime()
  }

  const streakByTitle = useMemo(() => {
    const map = new Map<string, number>()
    const today = dayStart(Date.now())
    for (const title of presets) {
      let streak = 0
      let cursor = today
      // keep going back while each day has a completed task for this title
      // cap at 365 for safety
      for (let i = 0; i < 365; i++) {
        const nextDay = cursor + 24*60*60*1000 - 1
        const hasCompleted = tasks.some((t) => t.title === title && (t.dueAt ?? 0) >= cursor && (t.dueAt ?? 0) <= nextDay && !!t.completedAt)
        if (!hasCompleted) break
        streak += 1
        cursor -= 24*60*60*1000
      }
      map.set(title, streak)
    }
    return map
  }, [tasks, presets])

  async function add() {
    const t = title.trim()
    if (!t) return
    await addTask({ title: t })
    setTitle('')
    toast({ type: 'success', title: 'Task added', message: t })
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
                      onChange={async () => { await toggleTask(t.id); toast({ type: 'success', message: t.completedAt ? 'Marked incomplete' : 'Checked in!' }) }}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-blue-500/30"
                    />
                    <span className={t.completedAt ? 'line-through text-black/50' : ''}>{t.title}</span>
                    <span className="ml-2 text-xs rounded-full bg-black/5 px-2 py-0.5 text-black/70">{streakByTitle.get(t.title) || 0}d</span>
                  </label>
                  <button onClick={async () => { await removeTask(t.id); toast({ type: 'info', message: 'Deleted' }) }} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Preset management */}
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Presets</h2>
              <span className="text-xs text-black/50">Daily check-ins</span>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                placeholder="Add preset (e.g., Read)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                onKeyDown={(e) => e.key === 'Enter' && (() => { const v = newPreset.trim(); if (!v) return; addPreset(v); setNewPreset(''); toast({ type: 'success', message: 'Preset added' }) })()}
              />
              <button onClick={() => { const v = newPreset.trim(); if (!v) return; addPreset(v); setNewPreset(''); toast({ type: 'success', message: 'Preset added' }) }} className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-4 py-2 hover:bg-black/90">
                <PlusIcon className="h-4 w-4" /> Add
              </button>
            </div>
            <ul className="divide-y divide-black/5">
              {presets.length === 0 && <li className="p-3 text-sm text-black/60">No presets</li>}
              {presets.map((p) => (
                <li key={p} className="flex items-center justify-between p-3 text-sm">
                  <span>{p}</span>
                  <button onClick={() => { removePreset(p); toast({ type: 'info', message: 'Preset removed' }) }} className="text-xs text-red-600 hover:text-red-700">Remove</button>
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

          {/* Daily Diary */}
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Daily Diary</h2>
              <span className="text-xs text-black/50">Note for {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="How was your day? Thoughts, reflections, duas..."
              className="w-full min-h-[120px] rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={async () => { await saveNoteForDate(selectedDate, noteContent); await loadNotes(); toast({ type: 'success', message: 'Saved' }) }}
                className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-4 py-2 hover:bg-black/90"
              >
                Save
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
                  <button onClick={async () => { await removeTask(t.id); toast({ type: 'info', message: 'Deleted' }) }} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Diary History */}
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Diary History</h2>
              <span className="text-xs text-black/50">Recent notes</span>
            </div>
            <ul className="divide-y divide-black/5">
              {notes.length === 0 && <li className="p-3 text-sm text-black/60">No entries yet</li>}
              {notes
                .slice()
                .sort((a, b) => b.date - a.date)
                .map((n) => (
                  <li key={n.id} className="p-3">
                    <button
                      className={`text-sm underline underline-offset-4 ${selectedDate === n.date ? 'font-semibold' : ''}`}
                      onClick={() => { setSelectedDate(n.date); toast({ type: 'info', message: `Opened ${new Date(n.date).toLocaleDateString()}` }) }}
                    >
                      {new Date(n.date).toLocaleDateString()}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
