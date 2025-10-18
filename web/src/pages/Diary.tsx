import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { PenToolIcon, ChevronLeft, ChevronRight, SaveIcon, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useToast } from '../ui/toast'

function dayStart(ms: number) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function DiaryPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const loadNoteByDate = useStore((s) => s.loadNoteByDate)
  const saveNoteForDate = useStore((s) => s.saveNoteForDate)
  const deleteNoteById = useStore((s) => s.deleteNoteById)
  const todayNote = useStore((s) => s.todayNote)

  const initialDate = useMemo(() => {
    const parsed = Number(date)
    return Number.isFinite(parsed) && parsed > 0 ? dayStart(parsed) : dayStart(Date.now())
  }, [date])

  const [currentDate, setCurrentDate] = useState<number>(initialDate)
  const [content, setContent] = useState('')

  useEffect(() => {
    setCurrentDate(initialDate)
  }, [initialDate])

  useEffect(() => {
    loadNoteByDate(currentDate)
  }, [currentDate, loadNoteByDate])

  useEffect(() => {
    setContent(todayNote?.content ?? '')
  }, [todayNote])

  function go(offsetDays: number) {
    const next = currentDate + offsetDays * 24 * 60 * 60 * 1000
    const ds = dayStart(next)
    setCurrentDate(ds)
    navigate(`/diary/${ds}`)
  }

  async function save() {
    await saveNoteForDate(currentDate, content)
    toast({ type: 'success', message: 'Saved' })
  }

  async function del() {
    if (todayNote?.id) {
      await deleteNoteById(todayNote.id)
      setContent('')
      toast({ type: 'info', message: 'Deleted note' })
    }
  }

  const dateLabel = new Date(currentDate).toLocaleDateString()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/tasks" className="underline underline-offset-4">← Back to Tasks</Link>
          <span className="opacity-40">/</span>
          <span>Diary</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/70 px-3 py-1.5 hover:bg-white">
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <div className="text-sm opacity-70">{dateLabel}</div>
          <button onClick={() => go(1)} className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/70 px-3 py-1.5 hover:bg-white">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Book-like diary */}
      <div className="relative mx-auto max-w-5xl select-none">
        <div className="relative rounded-2xl shadow-2xl overflow-hidden">
          {/* Cover shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />

          {/* Two-page spread */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left page: meta + small preview lines */}
            <div className="relative p-6 bg-[repeating-linear-gradient(transparent,transparent_28px,rgba(0,0,0,0.045)_29px,rgba(0,0,0,0.045)_30px)] bg-white">
              <div className="mb-3 text-xs tracking-wide uppercase opacity-60">{dateLabel}</div>
              <div className="text-sm opacity-70">Reflections</div>
              <div className="mt-3 h-[260px] rounded border border-black/10 bg-white/70 p-3 text-xs opacity-70 line-clamp-10 whitespace-pre-wrap">
                {content || '(No entry yet)'}
              </div>
            </div>

            {/* Right page: editor */}
            <div className="relative bg-white p-0">
              {/* Center fold */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-black/10" />

              <div className="p-6">
                <div className="mb-2 text-xs tracking-wide uppercase opacity-60">Write</div>
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts…"
                    className="w-full min-h-[340px] bg-[repeating-linear-gradient(transparent,transparent_28px,rgba(0,0,0,0.05)_29px,rgba(0,0,0,0.05)_30px)] focus:outline-none resize-none p-4 rounded-lg border border-black/10"
                  />

                  {/* Pen */}
                  <button
                    onClick={() => {
                      const ta = document.querySelector('textarea') as HTMLTextAreaElement | null
                      ta?.focus()
                    }}
                    className="hidden md:flex items-center gap-2 absolute -right-4 top-4 rotate-6 shadow-lg rounded-full bg-amber-300 text-black px-3 py-2 hover:rotate-3 transition"
                    title="Start writing"
                  >
                    <PenToolIcon className="h-4 w-4" />
                    Pen
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  {todayNote?.id && todayNote.date === currentDate && (
                    <button onClick={del} className="inline-flex items-center gap-1 rounded-md bg-red-600 text-white px-3 py-1.5 hover:bg-red-700">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                  <button onClick={save} className="inline-flex items-center gap-1 rounded-md bg-black text-white px-3 py-1.5 hover:bg-black/90">
                    <SaveIcon className="h-4 w-4" /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Outer border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/10" />
        </div>
      </div>
    </div>
  )
}
