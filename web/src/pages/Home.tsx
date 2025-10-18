export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Fuzzy white background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-40 bg-white opacity-90 blur-3xl" />
      </div>

      {/* Centered pulsating title */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <h1 className="text-8xl md:text-9xl font-black tracking-tight animate-pulse text-black">
          Task Manager
        </h1>
      </div>
    </div>
  )
}
