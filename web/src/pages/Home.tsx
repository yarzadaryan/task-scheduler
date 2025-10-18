import { Link } from 'react-router-dom'
import { CalendarIcon, CheckSquareIcon, TimerIcon } from 'lucide-react'

const dailyHadith = (() => {
  const hadiths: { text: string; source: string }[] = [
    {
      text:
        'Actions are but by intentions, and every person will have only what they intended.',
      source: 'Sahih al-Bukhari & Sahih Muslim',
    },
    {
      text:
        'The strong believer is better and more beloved to Allah than the weak believer, while there is good in both. Be eager for what benefits you, seek help from Allah, and do not be helpless.',
      source: 'Sahih Muslim 2664',
    },
    {
      text:
        'The most beloved deeds to Allah are those done regularly, even if they are few.',
      source: 'Sahih al-Bukhari 6465',
    },
  ]
  const now = new Date()
  const idx = (now.getFullYear() * 1000 + (now.getMonth() + 1) * 50 + now.getDate()) % hadiths.length
  return hadiths[idx]
})()

export default function HomePage() {
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
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="text-sm md:text-base text-black/75 leading-relaxed">“{dailyHadith.text}”</blockquote>
          <figcaption className="mt-2 text-xs text-black/50">{dailyHadith.source}</figcaption>
        </figure>
      </div>
    </div>
  )
}
