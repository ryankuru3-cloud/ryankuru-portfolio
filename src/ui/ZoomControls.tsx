import { useEffect } from 'react'
import { useZoomStore } from '../store/useZoomStore'
import { useViewStore } from '../store/useViewStore'
import { useReaderStore } from '../store/useReaderStore'

/**
 * Back button (shown when zoomed into an area) + Esc-to-exit. Precedence: if a reader
 * is open, Back/Esc closes the reader first; otherwise it exits the zoomed area. Clicking
 * the background also exits the zone (Canvas onPointerMissed). User view only.
 */
export default function ZoomControls() {
  const zone = useZoomStore((s) => s.zone)
  const setZone = useZoomStore((s) => s.setZone)
  const section = useReaderStore((s) => s.section)
  const closeReader = useReaderStore((s) => s.close)
  const mode = useViewStore((s) => s.mode)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // read fresh state so the handler never goes stale
      if (useReaderStore.getState().section) useReaderStore.getState().close()
      else useZoomStore.getState().setZone(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (mode !== 'user' || (!zone && !section)) return null

  const onBack = () => {
    if (section) closeReader()
    else setZone(null)
  }

  return (
    <button
      onClick={onBack}
      className="fixed left-5 top-5 z-40 flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:bg-white"
    >
      <span aria-hidden="true">←</span> Back
    </button>
  )
}
