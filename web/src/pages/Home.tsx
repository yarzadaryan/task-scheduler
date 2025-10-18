import { Link } from 'react-router-dom'

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
          Task Manager
        </h1>
        <Link
          to="/tasks"
          className="px-8 py-3 rounded-2xl bg-black text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.03]"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
