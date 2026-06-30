import { useUiStore } from '../store/useUiStore'
import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'
import { useReaderStore } from '../store/useReaderStore'

/**
 * Subtle "click any surface to explore" cue, shown only in the lobby (entered, User view,
 * not zoomed, no reader open) so first-time visitors realize the scene is interactive.
 */
export default function LobbyHint() {
  const entered = useUiStore((s) => s.entered)
  const isUser = useViewStore((s) => s.mode) === 'user'
  const zone = useZoomStore((s) => s.zone)
  const section = useReaderStore((s) => s.section)

  if (!entered || !isUser || zone || section) return null

  return (
    <div className="pointer-events-none fixed bottom-7 left-1/2 z-[55] -translate-x-1/2">
      <div className="flex items-center gap-2 border border-white/12 bg-arizona/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 backdrop-blur-xl">
        <span className="hint-pulse h-1.5 w-1.5 rounded-full bg-accent" />
        Click a labeled area to explore
      </div>
    </div>
  )
}
