import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, ButtonGroup, InlineStack, Select, Card } from '@shopify/polaris'
import { HADITHS } from '../data/hadiths'

function sixHourIndex(mod: number) {
  const now = new Date()
  const bucket = Math.floor(now.getHours() / 6) // 0..3
  const seed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 50 + now.getDate() * 2 + bucket
  return seed % Math.max(1, mod)
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const catParam = searchParams.get('cat') || 'all'
  const iParamRaw = searchParams.get('i')
  const iParam = iParamRaw ? Number(iParamRaw) : NaN
  const sahihOnly = useMemo(() => HADITHS.filter((h) => /(sahih\s+al-bukhari|sahih\s+muslim)/i.test(h.source)), [])
  const categories = useMemo(() => Array.from(new Set(sahihOnly.flatMap((h) => h.categories))).sort(), [sahihOnly])
  const filtered = useMemo(() => (catParam === 'all' ? sahihOnly : sahihOnly.filter((h) => h.categories.includes(catParam))), [catParam, sahihOnly])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const len = Math.max(1, filtered.length)
    const base = Number.isFinite(iParam) ? Math.abs(iParam) % len : sixHourIndex(len)
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
        <Button url="/tasks" variant="primary" size="large">Get Started</Button>
      </div>

      {/* Feature tabs */}
      <div className="relative mx-auto max-w-6xl px-4 pb-16 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <div className="font-semibold">Calendar</div>
              <div className="text-sm text-black/60">Plan by day, week, month</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="font-semibold">Tasks</div>
              <div className="text-sm text-black/60">Simple daily check‑ins</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="font-semibold">Timer</div>
              <div className="text-sm text-black/60">Focus with Pomodoro</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Motivation note (daily hadith) */}
      <div className="relative pb-10 px-4">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <InlineStack gap="200" align="center" blockAlign="center" wrap>
            <div style={{minWidth: 220}}>
              <Select
                label="Category"
                options={[{label:'All', value:'all'}, ...categories.map((c)=>({label:c, value:c}))]}
                value={catParam}
                onChange={onCategoryChange}
              />
            </div>
          </InlineStack>
          <figure className="text-center">
            <blockquote className="text-sm md:text-base text-black/75 leading-relaxed">“{current.text}”</blockquote>
            <figcaption className="mt-2 text-xs text-black/50">{current.source}</figcaption>
          </figure>
          <ButtonGroup>
            <Button onClick={() => updateParamIndex(index - 1)}>Prev</Button>
            <Button variant="primary" onClick={() => updateParamIndex(index + 1)}>Next</Button>
            <Button onClick={copyLink}>Copy link</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}
