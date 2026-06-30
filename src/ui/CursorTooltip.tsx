import { useEffect, useRef } from 'react'
import { useUiStore } from '../store/useUiStore'

/**
 * Small HUD chip that follows the cursor and names the clickable surface under it
 * (e.g. "About Me ↗"), so it's obvious the room is interactive. Driven by `hover`,
 * set on the fixtures' pointer-over/out.
 *
 * PERF: the chip's POSITION is written straight to the DOM transform (rAF-coalesced, on its
 * own GPU layer) so the cursor never triggers a React re-render — that's what makes it follow
 * smoothly. React only re-renders when the LABEL changes (entering/leaving a surface), which is
 * rare. The chip stays mounted and just fades opacity, so it's already at the cursor when shown.
 */
export default function CursorTooltip() {
  const hover = useUiStore((s) => s.hover)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let x = -200
    let y = -200
    const apply = () => {
      raf = 0
      const el = ref.current
      if (el) el.style.transform = `translate3d(${x + 16}px, ${y + 18}px, 0)`
    }
    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(apply) // coalesce to one write per frame
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[80] will-change-transform transition-opacity duration-150"
      style={{ opacity: hover ? 1 : 0, transform: 'translate3d(-200px,-200px,0)' }}
      aria-hidden={!hover}
    >
      <div className="flex items-center gap-1.5 border border-white/15 bg-arizona/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur">
        {hover} <span className="text-accent">↗</span>
      </div>
    </div>
  )
}
