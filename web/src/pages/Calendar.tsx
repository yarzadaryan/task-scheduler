import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import type { DateClickArg } from '@fullcalendar/interaction'
import { useStore } from '../store'

function QuickAdd() {
  const addEvent = useStore((s) => s.addEvent)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [allDay, setAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  function toMs(dateStr: string, timeStr: string) {
    const [y,m,d] = dateStr.split('-').map(Number)
    const [hh,mm] = timeStr.split(':').map(Number)
    const dt = new Date(y, (m-1), d, hh ?? 0, mm ?? 0, 0, 0)
    return dt.getTime()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    if (allDay) {
      await addEvent({ title: t, start: toMs(date, '00:00'), allDay: true })
    } else {
      const start = toMs(date, startTime)
      const end = toMs(date, endTime)
      await addEvent({ title: t, start, end, allDay: false })
    }
    setTitle('')
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
      <div className="md:col-span-2">
        <label className="block text-xs text-black/60 mb-1">Title</label>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., Work, Fasting" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <div>
        <label className="block text-xs text-black/60 mb-1">Date</label>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none" />
      </div>
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-black/70"><input type="checkbox" checked={allDay} onChange={(e)=>setAllDay(e.target.checked)} /> All-day</label>
      </div>
      {!allDay && (
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-black/60 mb-1">Start</label>
            <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs text-black/60 mb-1">End</label>
            <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm outline-none" />
          </div>
        </div>
      )}
      <div className="md:col-span-1">
        <button type="submit" className="w-full rounded-xl bg-black text-white px-4 py-2 hover:bg-black/90">Add</button>
      </div>
    </form>
  )
}

export default function CalendarPage() {
  const events = useStore((s) => s.events)
  const addEvent = useStore((s) => s.addEvent)
  const removeEvent = useStore((s) => s.removeEvent)

  const fcBaseEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: dayjs(e.start).toISOString(),
        end: e.end ? dayjs(e.end).toISOString() : undefined,
        allDay: e.allDay,
      })),
    [events]
  )

  // Hijri (Islamic) calendar formatters using Intl API (no extra deps)
  const islamicDay = useMemo(() => new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' }), [])
  const islamicMonthYear = useMemo(() => new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'long', year: 'numeric' }), [])
  const [hijriLabel, setHijriLabel] = useState<string>('')
  const [viewStart, setViewStart] = useState<Date | null>(null)
  const [viewEnd, setViewEnd] = useState<Date | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  function startOfDay(ms: number) {
    const d = new Date(ms)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  function eachDayInclusive(startISO: string, endISO: string): number[] {
    const days: number[] = []
    const start = startOfDay(new Date(startISO).getTime())
    const end = startOfDay(new Date(endISO).getTime())
    for (let t = start; t <= end; t += 24 * 60 * 60 * 1000) {
      days.push(t)
    }
    return days
  }

  // Build Islamic holidays for the current visible range
  const holidayEvents = useMemo(() => {
    if (!viewStart || !viewEnd) return [] as { id: string; title: string; start: string; allDay: boolean }[]
    const out: { id: string; title: string; start: string; allDay: boolean }[] = []

    const islamicDayNum = new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' })
    const islamicMonthNum = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' })
    const islamicMonthLong = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'long' })

    function parts(d: Date) {
      const day = Number(islamicDayNum.format(d))
      const month = Number(islamicMonthNum.format(d)) // 1..12
      const monthName = islamicMonthLong.format(d)
      return { day, month, monthName }
    }

    for (let t = startOfDay(viewStart.getTime()); t <= startOfDay(viewEnd.getTime()); t += 24*60*60*1000) {
      const d = new Date(t)
      const { day, month } = parts(d)

      const push = (key: string, title: string) => {
        out.push({ id: `hijri-${t}-${key}` , title, start: new Date(t).toISOString(), allDay: true })
      }

      // Ayyam al-Bid (White Days) 13-15 every Hijri month
      if (day >= 13 && day <= 15) push('white', 'White Days (13–15)')

      // 1 Muharram (Islamic New Year) — month 1
      if (month === 1 && day === 1) push('newyear', 'Islamic New Year (1 Muharram)')
      // 10 Muharram — Ashura
      if (month === 1 && day === 10) push('ashura', 'Ashura (10 Muharram)')

      // 1 Rajab — month 7
      if (month === 7 && day === 1) push('rajab', '1 Rajab')

      // Ramadan begins — 1 Ramadan (month 9)
      if (month === 9 && day === 1) push('ramadan', 'Ramadan begins (1 Ramadan)')

      // Eid al-Fitr — 1 Shawwal (month 10)
      if (month === 10 && day === 1) push('eidfitr', 'Eid al-Fitr (1 Shawwal)')

      // Dhul-Hijjah (month 12): 9 Arafah, 10 Eid al-Adha, 11–13 Tashriq
      if (month === 12 && day === 9) push('arafah', 'Day of Arafah (9 Dhul-Hijjah)')
      if (month === 12 && day === 10) push('eidadha', 'Eid al-Adha (10 Dhul-Hijjah)')
      if (month === 12 && day >= 11 && day <= 13) push('tashriq', `Days of Tashriq (${day} Dhul-Hijjah)`)    
    }

    return out
  }, [viewStart, viewEnd])

  const fcEvents = useMemo(() => {
    return [...fcBaseEvents, ...holidayEvents]
  }, [fcBaseEvents, holidayEvents])

  function CalToolbar() {
    const selected = selectedEventId ? events.find((e) => e.id === selectedEventId) : null
    return (
      <div className="flex items-center gap-2">
        {selected ? (
          <div className="text-xs text-black/60 hidden md:block">Selected: <span className="font-medium">{selected.title}</span></div>
        ) : (
          <div className="text-xs text-black/40 hidden md:block">Select an event to manage</div>
        )}
        <button
          onClick={async () => { if (!selectedEventId) return; await removeEvent(selectedEventId); setSelectedEventId(null) }}
          disabled={!selectedEventId}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 border ${selectedEventId ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' : 'bg-white text-black/40 border-black/10 cursor-not-allowed'}`}
          title="Delete selected event"
        >Delete</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-black/60">Plan by month, week, or day</p>
        </div>
      </div>

      {/* Quick add form */}
      <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <QuickAdd />
          <CalToolbar />
        </div>
      </div>

      <div className="relative rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-3 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable
          editable
          height="auto"
          aspectRatio={1.6}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={fcEvents}
          dayCellContent={(arg) => {
            // Large Gregorian day number with small Hijri subtext
            const greg = String(arg.date.getDate())
            const hijri = islamicDay.format(arg.date)
            return {
              html: `<div class="flex flex-col items-end pr-1 pt-1">
                       <div class="text-base md:text-lg font-semibold">${greg}</div>
                       <div class="text-[10px] opacity-60 leading-none">${hijri}</div>
                     </div>`
            }
          }}
          datesSet={(arg) => {
            // Update Hijri month label when view changes
            const label = islamicMonthYear.format(arg.start)
            setHijriLabel(label)
            setViewStart(arg.start)
            setViewEnd(arg.end)
            setSelectedEventId(null)
          }}
          dateClick={(info: DateClickArg) => {
            const title = prompt('New event title?')?.trim()
            if (!title) return
            const time = prompt('Time (HH:MM-HH:MM) or leave blank for all-day:')?.trim()
            function parseTime(str: string): [number, number] | null {
              const m = str.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/)
              if (!m) return null
              const [ , sh, sm, eh, em ] = m
              const sH = Math.min(23, Math.max(0, Number(sh)))
              const sM = Math.min(59, Math.max(0, Number(sm)))
              const eH = Math.min(23, Math.max(0, Number(eh)))
              const eM = Math.min(59, Math.max(0, Number(em)))
              const base = new Date(info.dateStr)
              const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sH, sM, 0, 0).getTime()
              const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eH, eM, 0, 0).getTime()
              return [start, Math.max(end, start + 15*60*1000)]
            }
            if (time) {
              const parsed = parseTime(time)
              if (parsed) {
                const [start, end] = parsed
                addEvent({ title, start, end, allDay: false })
              } else {
                alert('Invalid time. Example: 09:00-10:30')
              }
            } else {
              addEvent({ title, start: dayjs(info.dateStr).valueOf(), allDay: true })
            }
          }}
          select={(sel) => {
            const raw = prompt('Add tags for these days (comma-separated):')?.trim()
            if (!raw) return
            const tags = raw.split(',').map((s) => s.trim()).filter(Boolean)
            if (tags.length === 0) return
            const days = eachDayInclusive(sel.startStr, sel.endStr)
            days.forEach((d) => {
              tags.forEach((t) => {
                addEvent({ title: `#${t}`, start: d, allDay: true })
              })
            })
          }}
          eventClick={(info: EventClickArg) => {
            setSelectedEventId(info.event.id)
          }}
        />
        {hijriLabel && (
          <div className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 mt-1 text-xs text-black/60">
            <span className="align-middle">Hijri:</span> <span className="font-medium">{hijriLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
