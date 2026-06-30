import { useState, type ReactNode } from 'react'
import { AREAS, SECTIONS } from '../config/content'
import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'
import { useReaderStore } from '../store/useReaderStore'
import { goToSection } from '../lib/useItemInteraction'
import { useUiStore } from '../store/useUiStore'
import Corners from './hud/Corners'

/**
 * Top navbar — "Sharp HUD" theme: a translucent Arizona-navy bar, uppercase tracked links,
 * Cardinal-red (accent) active states, and a sharp-cornered mega-menu with corner brackets. The
 * three centered area links mirror the room's 3D wall labels. About Me + Resume and
 * Portfolio open dropdowns of their sections; Professional Evolution is a direct link.
 * Pinned above everything (z-70) so it stays usable while a reader is open.
 */

const ICONS: Record<string, ReactNode> = {
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  grid: (
    <>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </>
  ),
  shirt: <path d="M15 4l6 2v5h-3v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8H3V6l6-2a3 3 0 0 0 6 0" />,
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 5 12 8" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 5 12 8" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </>
  ),
}

function Icon({ name }: { name?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name ? ICONS[name] : null}
    </svg>
  )
}

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

function triggerClass(active: boolean, isOpen: boolean) {
  if (active) return 'text-accent bg-accent/10'
  if (isOpen) return 'text-white bg-white/5'
  return 'text-slate-300 hover:bg-white/5 hover:text-white'
}

export default function TopNav() {
  const isUser = useViewStore((s) => s.mode) === 'user'
  const zone = useZoomStore((s) => s.zone)
  const activeSection = useReaderStore((s) => s.section)
  const entered = useUiStore((s) => s.entered)
  const [open, setOpen] = useState<string | null>(null)

  if (!isUser) return null

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] flex h-16 items-center justify-center border-b border-accent/30 bg-arizona/92 px-5 shadow-[0_16px_38px_-10px_rgba(0,0,0,0.85)] backdrop-blur-xl ${
        entered ? 'nav-reveal' : ''
      }`}
    >
      <nav className="flex items-center gap-1.5">
        {AREAS.map((area) => {
          const hasSub = area.sections.length > 1
          const areaActive = zone === area.zone
          const cls = `flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition`

          if (!hasSub) {
            return (
              <button key={area.zone} onClick={() => goToSection(area.sections[0])} className={`${cls} ${triggerClass(areaActive, false)}`}>
                {area.label}
              </button>
            )
          }

          return (
            <div key={area.zone} className="relative" onMouseEnter={() => setOpen(area.zone)} onMouseLeave={() => setOpen(null)}>
              <button onClick={() => goToSection(area.sections[0])} className={`${cls} ${triggerClass(areaActive, open === area.zone)}`}>
                {area.label}
                <Chevron />
              </button>

              {open === area.zone && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2.5">
                  <div className="relative w-[340px] border border-white/12 bg-arizona/92 p-2 shadow-2xl backdrop-blur-xl">
                    <Corners size="h-3 w-3" />
                    {area.sections.map((sid) => {
                      const s = SECTIONS[sid]
                      const on = activeSection === sid
                      return (
                        <button
                          key={sid}
                          onClick={() => {
                            goToSection(sid)
                            setOpen(null)
                          }}
                          className={`flex w-full items-start gap-3 p-3 text-left transition ${on ? 'bg-accent/10' : 'hover:bg-white/5'}`}
                        >
                          <span className={`mt-0.5 shrink-0 ${on ? 'text-accent' : 'text-slate-400'}`}>
                            <Icon name={s.icon} />
                          </span>
                          <span className="flex flex-col">
                            <span className={`text-sm font-semibold ${on ? 'text-accent' : 'text-slate-100'}`}>{s.title}</span>
                            {s.navDesc && <span className="mt-0.5 font-mono text-[11px] leading-snug text-slate-500">{s.navDesc}</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </header>
  )
}
