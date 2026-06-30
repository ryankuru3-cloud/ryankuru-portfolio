import { useEffect } from 'react'
import { SECTIONS, AREAS } from '../config/content'
import { useNavConfirmStore } from '../store/useNavConfirmStore'
import { goToSection } from '../lib/useItemInteraction'
import Corners from './hud/Corners'

/**
 * Confirmation modal for in-app area-jump links. When a reader panel (About/Bio,
 * Professional Evolution) requests navigation, this asks "Open <section>?" before actually
 * dollying away, so an accidental click can't drop the visitor in the wrong area. Sits above
 * the Reader (z-80). Dismissed by Cancel, a backdrop click, or Esc — Esc is caught in the
 * CAPTURE phase + stopImmediatePropagation so it cancels THIS popup only and does not also
 * fall through to ZoomControls (which would close the reader underneath).
 */
export default function NavConfirm() {
  const pendingId = useNavConfirmStore((s) => s.pendingId)
  const clear = useNavConfirmStore((s) => s.clear)

  useEffect(() => {
    if (!pendingId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopImmediatePropagation()
      clear()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [pendingId, clear])

  if (!pendingId) return null
  const section = SECTIONS[pendingId]
  if (!section) return null
  const areaLabel = AREAS.find((a) => a.zone === section.zone)?.label ?? ''

  const confirm = () => {
    clear()
    goToSection(pendingId)
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center bg-midnight/70 px-4 backdrop-blur-sm"
      onClick={clear}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm border border-white/12 bg-arizona/95 p-7 text-center shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Corners />
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-accent">Confirm</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Open {section.title}?</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {areaLabel ? <>This takes you to the {areaLabel} area.</> : <>This takes you to another section.</>}
        </p>
        <div className="mt-6 flex justify-center gap-2.5">
          <button
            onClick={clear}
            className="border border-white/15 px-5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/40 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
