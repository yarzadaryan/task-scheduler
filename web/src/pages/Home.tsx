import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarIcon, CheckSquareIcon, TimerIcon } from 'lucide-react'
import { HADITHS } from '../data/hadiths'

function dayIndex(mod: number) {
  const now = new Date()
  return (now.getFullYear() * 1000 + (now.getMonth() + 1) * 50 + now.getDate()) % Math.max(1, mod)
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const catParam = searchParams.get('cat') || 'all'
  const iParamRaw = searchParams.get('i')
  const iParam = iParamRaw ? Number(iParamRaw) : NaN
  const categories = useMemo(() => Array.from(new Set(HADITHS.flatMap((h) => h.categories))).sort(), [])
  const filtered = useMemo(() => (catParam === 'all' ? HADITHS : HADITHS.filter((h) => h.categories.includes(catParam))), [catParam])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const len = Math.max(1, filtered.length)
    const base = Number.isFinite(iParam) ? Math.abs(iParam) % len : dayIndex(len)
    setIndex(base)
  }, [catParam, iParamRaw, filtered.length])

  const current = filtered[index % Math.max(1, filtered.length)]

  function updateParamIndex(next: number) {
    const len = Math.max(1, filtered.length)
    const bounded = ((next % len) + len) % len
    setIndex(bounded)
    const sp = new URLSearchParams(searchParams)
    sp.set('i', String(bounded))
    setSearchParams(sp, { replace: true })
  }

  function onCategoryChange(v: string) {
    const sp = new URLSearchParams(searchParams)
    if (v === 'all') sp.delete('cat')
    else sp.set('cat', v)
    sp.set('i', '0')
    setSearchParams(sp)
  }

  async function copyLink() {
    const url = new URL(window.location.href)
    if (catParam === 'all') url.searchParams.delete('cat')
    else url.searchParams.set('cat', catParam)
    url.searchParams.set('i', String(index))
    try {
      await navigator.clipboard.writeText(url.toString())
      // lightweight feedback
      alert('Link copied')
    } catch {
      // fallback: no-op
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Fuzzy white background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-40 bg-white opacity-90 blur-3xl" />
      </div>

      {/* Centered pulsating title */}
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-8 px-4">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight animate-pulse text-black">
          Himmah
        </h1>
        <p className="text-black/70 text-base md:text-lg -mt-2">Strength. Resolve. Ability.</p>
        <Link
          to="/tasks"
          className="px-8 py-3 rounded-2xl bg-black text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03]"
        >
          Get Started
        </Link>
      </div>

      {/* Feature tabs */}
      <div className="relative mx-auto max-w-6xl px-4 pb-16 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Calendar</div>
                <div className="text-sm text-black/60">Plan by day, week, month</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <CheckSquareIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Tasks</div>
                <div className="text-sm text-black/60">Simple daily check‑ins</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white">
                <TimerIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Timer</div>
                <div className="text-sm text-black/60">Focus with Pomodoro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation note (daily hadith) */}
      <div className="relative pb-10 px-4">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <label className="text-xs text-black/60">Category</label>
            <select
              value={catParam}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="select"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <figure className="text-center">
            <blockquote className="text-sm md:text-base text-black/75 leading-relaxed">“{current.text}”</blockquote>
            <figcaption className="mt-2 text-xs text-black/50">{current.source}</figcaption>
          </figure>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={() => updateParamIndex(index - 1)}>Prev</button>
            <button className="btn btn-primary" onClick={() => updateParamIndex(index + 1)}>Next</button>
            <button className="btn btn-outline" onClick={copyLink}>Copy link</button>
          </div>
        </div>
      </div>
    </div>
  )
}
