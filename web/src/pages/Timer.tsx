import { useEffect, useMemo, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react'
import { useToast } from '../ui/toast'
import { useStore } from '../store'

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TimerPage() {
  const [workMin, setWorkMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [target, setTarget] = useState<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const remaining = useMemo(() => (target ? target - Date.now() : workMin * 60_000), [target, workMin])
  const { toast } = useToast()
  const addEvent = useStore((s) => s.addEvent)
  const updateEvent = useStore((s) => s.updateEvent)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!isRunning) return
    tickRef.current = requestAnimationFrame(function loop() {
      if (target && Date.now() >= target) {
        // time's up
        notify(isBreak ? 'Break finished' : 'Work session finished')
        // Close current calendar event at this boundary
        if (activeEventId) {
          updateEvent(activeEventId, { end: Date.now() })
          setActiveEventId(null)
        }
        const nextTarget = Date.now() + (isBreak ? workMin : breakMin) * 60_000
        setIsBreak((b) => !b)
        setTarget(nextTarget)
        const nextTitle = !isBreak ? 'Break Session' : 'Work Session'
        // Start next session event
        addEvent({ title: nextTitle, start: Date.now(), allDay: false }).then((evt) => setActiveEventId(evt.id))
      }
      tickRef.current = requestAnimationFrame(loop)
    })
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current)
      tickRef.current = null
    }
  }, [isRunning, target, workMin, breakMin, isBreak])

  function start() {
    if (!target) {
      setTarget(Date.now() + workMin * 60_000)
    }
    setIsRunning(true)
    const title = isBreak ? 'Break Session' : 'Work Session'
    // If no active event, create one now
    if (!activeEventId) {
      addEvent({ title, start: Date.now(), allDay: false }).then((evt) => setActiveEventId(evt.id))
    }
    toast({ type: 'success', message: isBreak ? 'Resumed break' : 'Started work' })
  }
  function pause() {
    setIsRunning(false)
    if (target) {
      const rem = Math.max(0, target - Date.now())
      setTarget(Date.now() + rem)
    }
    if (activeEventId) {
      updateEvent(activeEventId, { end: Date.now() })
      setActiveEventId(null)
    }
    toast({ type: 'info', message: 'Paused' })
  }
  function reset() {
    setIsRunning(false)
    setIsBreak(false)
    setTarget(null)
    if (activeEventId) {
      updateEvent(activeEventId, { end: Date.now() })
      setActiveEventId(null)
    }
    toast({ type: 'info', message: 'Reset' })
  }

  function notify(body: string) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Tasks', { body })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
    toast({ type: 'success', message: body })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timer</h1>
          <p className="text-sm text-black/60">Focus with intervals and gentle reminders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Settings</h2>
            <div className="flex flex-col gap-3 text-sm">
              <label className="inline-flex items-center justify-between gap-2">
                <span>Work (min)</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={workMin}
                  onChange={(e) => setWorkMin(Number(e.target.value))}
                  className="w-24 rounded-md border border-black/10 bg-white px-2 py-1"
                />
              </label>
              <label className="inline-flex items-center justify-between gap-2">
                <span>Break (min)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMin}
                  onChange={(e) => setBreakMin(Number(e.target.value))}
                  className="w-24 rounded-md border border-black/10 bg-white px-2 py-1"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-6 shadow-sm flex flex-col items-center gap-4">
            <div className="text-xs uppercase tracking-wider text-black/50">{isBreak ? 'Break' : 'Work'} Session</div>
            <div className="text-7xl md:text-8xl font-extrabold tabular-nums tracking-tight">{format(remaining)}</div>
            <div className="flex items-center gap-3 pt-2">
              {!isRunning ? (
                <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-2.5 hover:bg-black/90">
                  <PlayIcon className="h-4 w-4" /> Start
                </button>
              ) : (
                <button onClick={pause} className="inline-flex items-center gap-2 rounded-full bg-black/80 text-white px-5 py-2.5 hover:bg-black">
                  <PauseIcon className="h-4 w-4" /> Pause
                </button>
              )}
              <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 hover:bg-white/90">
                <RotateCcwIcon className="h-4 w-4" /> Reset
              </button>
            </div>
            <p className="text-xs text-black/50">Tip: allow notifications to get an alert when a session ends.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
