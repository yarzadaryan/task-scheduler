import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import type { DateClickArg } from '@fullcalendar/interaction'
import { useStore } from '../store'

export default function CalendarPage() {
  const events = useStore((s) => s.events)
  const addEvent = useStore((s) => s.addEvent)
  const removeEvent = useStore((s) => s.removeEvent)

  const fcEvents = useMemo(
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

  // Hijri (Islamic) calendar formatter using Intl API (no extra deps)
  const islamicDay = useMemo(() =>
    new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' }),
  [])

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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-black/60">Plan by month, week, or day</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-3 shadow-sm">
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
            // Large Hijri day number with small Gregorian subtext
            const hijri = islamicDay.format(arg.date)
            const greg = String(arg.date.getDate())
            return {
              html: `<div class="flex flex-col items-end pr-1 pt-1">
                       <div class="text-base md:text-lg font-semibold">${hijri}</div>
                       <div class="text-[10px] opacity-60 leading-none">${greg}</div>
                     </div>`
            }
          }}
          dateClick={(info: DateClickArg) => {
            const title = prompt('New event title?')?.trim()
            if (!title) return
            addEvent({ title, start: dayjs(info.dateStr).valueOf(), allDay: true })
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
            const shouldDelete = confirm(`Delete "${info.event.title}"?`)
            if (shouldDelete) {
              removeEvent(info.event.id)
            }
          }}
        />
      </div>
    </div>
  )
}
