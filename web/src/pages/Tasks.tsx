import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [newPreset, setNewPreset] = useState('')
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const { toast } = useToast()
  const todayNote = useStore((s) => s.todayNote)
  const notes = useStore((s) => s.notes)
  const loadNotes = useStore((s) => s.loadNotes)
  const loadNoteByDate = useStore((s) => s.loadNoteByDate)
  const saveNoteForDate = useStore((s) => s.saveNoteForDate)
  const deleteNoteById = useStore((s) => s.deleteNoteById)
  const navigate = useNavigate()
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

  const timeOptions = useMemo(() => {
    const arr: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        arr.push(`${hh}:${mm}`)
      }
    }
    return arr
  }, [])

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

  const addEvent = useStore((s) => s.addEvent)
  const removeEvent = useStore((s) => s.removeEvent)

  function toMs(dateStr: string, timeStr: string) {
    const [y,m,d] = dateStr.split('-').map(Number)
    const [hh,mm] = timeStr.split(':').map(Number)
    const dt = new Date(y, (m-1), d, hh || 0, mm || 0, 0, 0)
    return dt.getTime()
  }

  async function add() {
    const t = title.trim()
    if (!t) return
    // If date/time provided, compute dueAt and possibly create a timed calendar event.
    let dueAt: number | undefined = undefined
    if (date) {
      if (startTime) {
        dueAt = toMs(date, startTime)
      } else {
        // start of day if no time
        dueAt = toMs(date, '00:00')
      }
    }
    await addTask({ title: t, dueAt })
    // Store auto-adds an all-day event at due date. If we have a time range, replace with a timed event.
    if (date && startTime && endTime) {
      // find and remove the all-day event for this task/date
      const dayStart = toMs(date, '00:00')
      const dayEnd = dayStart + 24*60*60*1000
      const ev = useStore.getState().events.find((e) => e.title.replace(/\s*✅$/, '') === t && e.allDay && e.start >= dayStart && e.start < dayEnd)
      if (ev) await removeEvent(ev.id)
      const start = toMs(date, startTime)
      const end = Math.max(start + 15*60*1000, toMs(date, endTime))
      await addEvent({ title: t, start, end, allDay: false })
    }
    // Recurring weekly (create next 6 weeks additionally)
    if (repeatWeekly && date) {
      const baseDayStart = toMs(date, '00:00')
      for (let i = 1; i < 7; i++) {
        const offset = i * 7 * 24 * 60 * 60 * 1000
        const nextDateMs = baseDayStart + offset
        const nextDate = new Date(nextDateMs)
        const y = nextDate.getFullYear()
        const m = String(nextDate.getMonth() + 1).padStart(2, '0')
        const d = String(nextDate.getDate()).padStart(2, '0')
        const nextDateStr = `${y}-${m}-${d}`
        const nextDueAt = startTime ? toMs(nextDateStr, startTime) : nextDateMs
        await addTask({ title: t, dueAt: nextDueAt })
        if (startTime && endTime) {
          const dayStart = nextDateMs
          const dayEnd = dayStart + 24*60*60*1000
          const ev = useStore.getState().events.find((e) => e.title.replace(/\s*✅$/, '') === t && e.allDay && e.start >= dayStart && e.start < dayEnd)
          if (ev) await removeEvent(ev.id)
          const start = toMs(nextDateStr, startTime)
          const end = Math.max(start + 15*60*1000, toMs(nextDateStr, endTime))
          await addEvent({ title: t, start, end, allDay: false })
        }
      }
    }
    setTitle('')
    setStartTime('')
    setEndTime('')
    setRepeatWeekly(false)
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs text-black/60 mb-1">Task</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What to do"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  onKeyDown={(e) => e.key === 'Enter' && add()}
                />
              </div>
              <div>
                <label className="block text-xs text-black/60 mb-1">Date</label>
                <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs text-black/60 mb-1">Start</label>
                <select value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none">
                  <option value="">All-day</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-black/60 mb-1">End</label>
                <select value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none">
                  <option value="">—</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <button onClick={add} className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-black text-white px-4 py-2 hover:bg-black/90">
                  <PlusIcon className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="md:col-span-5">
                <label className="inline-flex items-center gap-2 text-xs text-black/70">
                  <input type="checkbox" checked={repeatWeekly} onChange={(e)=>setRepeatWeekly(e.target.checked)} /> Repeat weekly (next 6 weeks)
                </label>
              </div>
            </div>
          </div>

          {/* Daily Diary */}
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Daily Diary</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-black/50">Note for {new Date(selectedDate).toLocaleDateString()}</span>
                <Link
                  to={`/diary/${selectedDate}`}
                  className="text-xs underline underline-offset-4"
                  title="Open in Diary"
                >Open in Diary</Link>
              </div>
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
                  <li key={n.id} className="p-3 flex items-center justify-between">
                    <button
                      className={`text-sm underline underline-offset-4 ${selectedDate === n.date ? 'font-semibold' : ''}`}
                      onClick={() => { setSelectedDate(n.date); navigate(`/diary/${n.date}`) }}
                    >
                      {new Date(n.date).toLocaleDateString()}
                    </button>
                    <button
                      onClick={async () => {
                        await deleteNoteById(n.id)
                        if (todayNote?.id === n.id) { setNoteContent('') }
                        toast({ type: 'info', message: 'Deleted note' })
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                      title="Delete note"
                    >Delete</button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
