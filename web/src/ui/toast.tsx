import { create } from 'zustand'
import { useEffect } from 'react'

export type Toast = { id: string; title?: string; message: string; type?: 'info' | 'success' | 'error' }

interface ToastState {
  toasts: Toast[]
  show: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (t) => {
    const id = crypto.randomUUID()
    const toast = { id, type: 'info' as const, ...t }
    set({ toasts: [...get().toasts, toast] })
    setTimeout(() => get().dismiss(id), 3500)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}))

export function useToast() {
  const show = useToastStore((s) => s.show)
  return { toast: show }
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    // no-op hook to keep zustand subscription active
  }, [])

  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-sm rounded-xl border px-4 py-3 shadow-md backdrop-blur bg-white/80 border-black/10 dark:bg-black/70 dark:text-white ${
            t.type === 'success' ? 'border-green-500/30' : t.type === 'error' ? 'border-red-500/30' : ''
          }`}
        >
          {t.title && <div className="text-sm font-semibold mb-0.5">{t.title}</div>}
          <div className="text-sm opacity-90">{t.message}</div>
          <button className="absolute top-1 right-2 text-xs opacity-60 hover:opacity-100" onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
