import { useEffect, useMemo, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react'

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

  useEffect(() => {
    if (!isRunning) return
    tickRef.current = requestAnimationFrame(function loop() {
      if (target && Date.now() >= target) {
        // time's up
        notify(isBreak ? 'Break finished' : 'Work session finished')
        const nextTarget = Date.now() + (isBreak ? workMin : breakMin) * 60_000
        setIsBreak((b) => !b)
        setTarget(nextTarget)
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
  }
  function pause() {
    setIsRunning(false)
    if (target) {
      const rem = Math.max(0, target - Date.now())
      setTarget(Date.now() + rem)
    }
  }
  function reset() {
    setIsRunning(false)
    setIsBreak(false)
    setTarget(null)
  }

  function notify(body: string) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Tasks', { body })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Timer</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          Work
          <input
            type="number"
            min={1}
            max={120}
            value={workMin}
            onChange={(e) => setWorkMin(Number(e.target.value))}
            className="w-20 rounded-md border border-black/10 bg-white/70 px-2 py-1"
          />
          min
        </label>
        <label className="inline-flex items-center gap-2">
          Break
          <input
            type="number"
            min={1}
            max={60}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            className="w-20 rounded-md border border-black/10 bg-white/70 px-2 py-1"
          />
          min
        </label>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl font-bold tabular-nums tracking-tight">{format(remaining)}</div>
        <div className="text-sm text-black/60">{isBreak ? 'Break' : 'Work'}</div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 hover:bg-black/90">
              <PlayIcon className="h-4 w-4" /> Start
            </button>
          ) : (
            <button onClick={pause} className="inline-flex items-center gap-2 rounded-full bg-black/80 text-white px-4 py-2 hover:bg-black">
              <PauseIcon className="h-4 w-4" /> Pause
            </button>
          )}
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 hover:bg-white">
            <RotateCcwIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <p className="text-xs text-black/50">Tip: allow notifications in your browser to get an alert when a session ends.</p>
    </div>
  )
}
