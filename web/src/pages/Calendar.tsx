import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useMemo, useState } from 'react'
import { Banner, Button, ButtonGroup, Checkbox, InlineStack, Select, TextField } from '@shopify/polaris'
import dayjs from 'dayjs'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import type { DateClickArg } from '@fullcalendar/interaction'
import { useStore } from '../store'

function QuickAdd({ date, onDateChange, onSuccess }: { date: string; onDateChange: (v: string) => void; onSuccess: (msg: string) => void }) {
  const addEvent = useStore((s) => s.addEvent)
  const [title, setTitle] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
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

  function toMs(dateStr: string, timeStr: string) {
    const [y,m,d] = dateStr.split('-').map(Number)
    const [hh,mm] = timeStr.split(':').map(Number)
    const dt = new Date(y, (m-1), d, hh ?? 0, mm ?? 0, 0, 0)
    return dt.getTime()
  }

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
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
    onSuccess('Event added')
  }

  return (
    <form onSubmit={submit} className="w-full">
      <InlineStack gap="200" align="space-between" blockAlign="end" wrap>
        <div style={{minWidth: 260}}>
          <TextField label="Title" autoComplete="off" value={title} onChange={setTitle} placeholder="e.g., Work, Fasting" />
        </div>
        <div>
          <TextField label="Date" type="date" value={date} onChange={onDateChange} autoComplete="off" />
        </div>
        <div>
          <Checkbox label="All-day" checked={allDay} onChange={setAllDay} />
        </div>
        {!allDay && (
          <>
            <div>
              <Select label="Start" options={timeOptions.map((t)=>({label:t, value:t}))} value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <Select label="End" options={timeOptions.map((t)=>({label:t, value:t}))} value={endTime} onChange={setEndTime} />
            </div>
          </>
        )}
        <div>
          <Button variant="primary" onClick={()=>submit()}>
            Add
          </Button>
        </div>
      </InlineStack>
    </form>
  )
}

export default function CalendarPage() {
  const events = useStore((s) => s.events)
  const addEvent = useStore((s) => s.addEvent)
  const removeEvent = useStore((s) => s.removeEvent)
  const method = useStore((s) => s.prayerMethod)
  const madhab = useStore((s) => s.prayerMadhab)
  const setMethod = useStore((s) => s.setPrayerMethod)
  const setMadhab = useStore((s) => s.setPrayerMadhab)
  const [quickDate, setQuickDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [banner, setBanner] = useState<{ tone: 'success' | 'critical' | 'info'; message: string } | null>(null)

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
    const updateEvent = useStore((s) => s.updateEvent)
    const selected = selectedEventId ? events.find((e) => e.id === selectedEventId) : null
    const [etitle, setEtitle] = useState<string>(selected?.title ?? '')
    const [edate, setEdate] = useState<string>(() => selected ? dayjs(selected.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
    const [eAllDay, setEAllDay] = useState<boolean>(selected?.allDay ?? true)
    const [eStart, setEStart] = useState<string>(() => selected ? dayjs(selected.start).format('HH:mm') : '09:00')
    const [eEnd, setEEnd] = useState<string>(() => selected?.end ? dayjs(selected.end).format('HH:mm') : '10:00')

    // sync when selection changes
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

    function toMs(dateStr: string, timeStr: string) {
      const [y,m,d] = dateStr.split('-').map(Number)
      const [hh,mm] = timeStr.split(':').map(Number)
      return new Date(y, (m-1), d, hh ?? 0, mm ?? 0, 0, 0).getTime()
    }

    async function save() {
      if (!selected) return
      const patch: any = { title: etitle }
      if (eAllDay) {
        patch.start = toMs(edate, '00:00')
        patch.end = undefined
        patch.allDay = true
      } else {
        const s = toMs(edate, eStart)
        const e = toMs(edate, eEnd)
        patch.start = s
        patch.end = Math.max(e, s + 15*60*1000)
        patch.allDay = false
      }
      await updateEvent(selected.id, patch)
      setBanner({ tone: 'success', message: 'Event saved' })
    }

    async function del() {
      if (!selectedEventId) return
      await removeEvent(selectedEventId)
      setSelectedEventId(null)
      setBanner({ tone: 'critical', message: 'Event deleted' })
    }

    // refresh state when selected changes
    useMemo(() => {
      setEtitle(selected?.title ?? '')
      setEdate(selected ? dayjs(selected.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
      setEAllDay(selected?.allDay ?? true)
      setEStart(selected ? dayjs(selected.start).format('HH:mm') : '09:00')
      setEEnd(selected?.end ? dayjs(selected.end).format('HH:mm') : '10:00')
      return null
    }, [selected?.id])

    return (
      <div style={{width:'100%'}}>
        {selected ? (
          <InlineStack gap="200" align="end" blockAlign="end" wrap>
            <div style={{minWidth: 220}}>
              <TextField label="Title" value={etitle} onChange={setEtitle} autoComplete="off" />
            </div>
            <div>
              <TextField label="Date" type="date" value={edate} onChange={setEdate} autoComplete="off" />
            </div>
            <div>
              <Checkbox label="All-day" checked={eAllDay} onChange={setEAllDay} />
            </div>
            {!eAllDay && (
              <>
                <div>
                  <Select label="Start" options={timeOptions.map((t)=>({label:t, value:t}))} value={eStart} onChange={setEStart} />
                </div>
                <div>
                  <Select label="End" options={timeOptions.map((t)=>({label:t, value:t}))} value={eEnd} onChange={setEEnd} />
                </div>
              </>
            )}
            <ButtonGroup>
              <Button tone="critical" onClick={del}>Delete</Button>
              <Button variant="primary" onClick={save}>Save</Button>
            </ButtonGroup>
          </InlineStack>
        ) : (
          <div className="text-xs text-black/40 hidden md:block">Select an event to manage</div>
        )}
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
          <QuickAdd date={quickDate} onDateChange={setQuickDate} onSuccess={(m)=>setBanner({tone:'success', message:m})} />
          <CalToolbar />
        </div>
        {hijriLabel && (
          <div className="mt-2 w-full flex flex-col items-center gap-3">
            <div className="text-xs text-black/70 px-3 py-1 rounded-full border border-black/10 bg-white/70">Hijrah: <span className="font-medium">{hijriLabel}</span></div>
            <InlineStack gap="200" align="center" wrap>
              <div style={{minWidth: 220}}>
                <Select
                  label="Prayer method"
                  options={[
                    {label:'North America (ISNA)', value:'NorthAmerica'},
                    {label:'Muslim World League', value:'MuslimWorldLeague'},
                    {label:'Umm al-Qura', value:'UmmAlQura'},
                    {label:'Egyptian', value:'Egyptian'},
                    {label:'Karachi', value:'Karachi'},
                    {label:'Dubai', value:'Dubai'},
                    {label:'Qatar', value:'Qatar'},
                    {label:'Moonsighting Committee', value:'MoonsightingCommittee'},
                    {label:'Kuwait', value:'Kuwait'},
                    {label:'Singapore', value:'Singapore'},
                    {label:'Turkey', value:'Turkey'},
                    {label:'Tehran', value:'Tehran'},
                  ]}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <div style={{minWidth: 160}}>
                <Select
                  label="Madhab"
                  options={[{label:'Shafi', value:'Shafi'}, {label:'Hanafi', value:'Hanafi'}]}
                  value={madhab}
                  onChange={setMadhab}
                />
              </div>
            </InlineStack>
          </div>
        )}
        {banner && (
          <div className="mt-3">
            <Banner tone={banner.tone} title={banner.message} onDismiss={()=>setBanner(null)} />
          </div>
        )}
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
            setQuickDate(dayjs(info.dateStr).format('YYYY-MM-DD'))
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
        {/* Hijrah label moved to toolbar card above for alignment */}
      </div>
    </div>
  )
}
