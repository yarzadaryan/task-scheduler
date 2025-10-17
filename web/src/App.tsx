import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { BellIcon, CalendarIcon, CheckSquareIcon, TimerIcon } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useStore } from './store'
import { getNotificationPermission, requestNotificationPermission } from './lib/notifications'

const HomePage = lazy(() => import('./pages/Home'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const TasksPage = lazy(() => import('./pages/Tasks'))
const TimerPage = lazy(() => import('./pages/Timer'))

export default function App() {
  const load = useStore((s) => s.load)
  const location = useLocation()
  const isHome = location.pathname === '/'
  
  useEffect(() => {
    load()
  }, [load])

  const notifPerm = useMemo(() => getNotificationPermission(), [])

  return (
    <div className="min-h-screen">
      {!isHome && (
        <header className="sticky top-0 z-10 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-b border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight">Tasks</Link>
            <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/calendar"
              className={({ isActive }) => `inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${isActive ? 'bg-black/5' : 'hover:bg-black/5'}`}
            >
              <CalendarIcon className="h-4 w-4" /> Calendar
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) => `inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${isActive ? 'bg-black/5' : 'hover:bg-black/5'}`}
            >
              <CheckSquareIcon className="h-4 w-4" /> Tasks
            </NavLink>
            <NavLink
              to="/timer"
              className={({ isActive }) => `inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${isActive ? 'bg-black/5' : 'hover:bg-black/5'}`}
            >
              <TimerIcon className="h-4 w-4" /> Timer
            </NavLink>
            {notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
              <button
                onClick={() => requestNotificationPermission()}
                className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/70 px-3 py-1.5 hover:bg-white"
                title="Enable notifications"
              >
                <BellIcon className="h-4 w-4" /> Enable
              </button>
            )}
          </nav>
        </div>
        </header>
      )}
      <main className={isHome ? "" : "mx-auto max-w-6xl px-4 py-8"}>
        {!isHome && (
          <div className="rounded-2xl border border-black/5 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 p-6 shadow-sm">
            <Suspense fallback={<div>Loading…</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/timer" element={<TimerPage />} />
              </Routes>
            </Suspense>
          </div>
        )}
        {isHome && (
          <Suspense fallback={<div>Loading…</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/timer" element={<TimerPage />} />
            </Routes>
          </Suspense>
        )}
      </main>
    </div>
  )
}
