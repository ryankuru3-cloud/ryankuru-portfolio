import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'

/**
 * Segmented "Edit / User view" toggle (top-center).
 * - Edit: free orbit camera for building/inspecting (Garage-style controls).
 * - User view: the locked isometric framing a site visitor sees.
 */
export default function ViewToggle() {
  const mode = useViewStore((s) => s.mode)
  const setMode = useViewStore((s) => s.setMode)
  const setZone = useZoomStore((s) => s.setZone)

  const base = 'px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition'
  const active = 'bg-accent/15 text-accent'
  const idle = 'text-slate-400 hover:bg-white/5 hover:text-white'

  const go = (m: 'edit' | 'user') => {
    setZone(null) // always return to the lobby framing when switching modes
    setMode(m)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex gap-1 border border-white/12 bg-arizona/80 p-1 backdrop-blur-xl">
      <button className={`${base} ${mode === 'edit' ? active : idle}`} onClick={() => go('edit')}>
        Edit
      </button>
      <button className={`${base} ${mode === 'user' ? active : idle}`} onClick={() => go('user')}>
        User view
      </button>
    </div>
  )
}
