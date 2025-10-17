import { Link } from 'react-router-dom'
import { CalendarIcon, CheckSquareIcon, TimerIcon, BellIcon, DatabaseIcon, SparklesIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Pulsating Title */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-black tracking-tight animate-pulse text-black">
            Task Manager
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-800 font-light max-w-2xl mx-auto">
          Your minimalistic productivity companion. Calendar, tasks, and timer—all in one beautiful place.
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-center pt-4">
          <Link
            to="/calendar"
            className="group relative px-12 py-5 bg-black text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Feature */}
        <div className="group p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Calendar</h3>
          <p className="text-gray-600 leading-relaxed">
            Month, week, and day views. Click to add events. Drag to reschedule. Everything syncs instantly.
          </p>
        </div>

        {/* Tasks Feature */}
        <div className="group p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <CheckSquareIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Tasks</h3>
          <p className="text-gray-600 leading-relaxed">
            Simple task management. Add, complete, delete. All data persists locally with IndexedDB.
          </p>
        </div>

        {/* Timer Feature */}
        <div className="group p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <TimerIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Timer</h3>
          <p className="text-gray-600 leading-relaxed">
            Pomodoro technique built-in. Configurable work and break sessions with browser notifications.
          </p>
        </div>
      </div>

      {/* Additional Features */}
      <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <DatabaseIcon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Offline First</h4>
          <p className="text-sm text-gray-600">Works without internet. All data stored locally.</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto">
            <BellIcon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Notifications</h4>
          <p className="text-sm text-gray-600">Browser alerts for timer sessions and reminders.</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Minimalistic</h4>
          <p className="text-sm text-gray-600">Clean design. No clutter. Just what you need.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 text-center text-gray-500 text-sm">
        <p>Built with React, TypeScript, Tailwind CSS, and ❤️</p>
      </div>
    </div>
  )
}
