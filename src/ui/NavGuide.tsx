import { useState, type ReactNode } from 'react'
import { useUiStore } from '../store/useUiStore'
import { useViewStore } from '../store/useViewStore'
import { useReaderStore } from '../store/useReaderStore'
import Corners from './hud/Corners'

/**
 * "Help me navigate" — a left-edge guide that spells out, in a few quick lines, how to
 * move through the 3D portfolio so a first-time visitor is never lost. Shown in User view
 * once they've entered and no full-screen reader is open. A standalone "Hide Me" button
 * sits above the box and collapses it to a slim "Guide" tab. Sharp-HUD chrome styling.
 */

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const Compass = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icon>
)
const Cursor = () => (
  <Icon>
    <path d="M4 4l7 16 2.2-6.8L20 11 4 4z" />
  </Icon>
)
const Expand = () => (
  <Icon>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </Icon>
)
const Menu = () => (
  <Icon>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
)
const Back = () => (
  <Icon>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Icon>
)
const EyeOff = () => (
  <Icon>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </Icon>
)

type Step = { icon: ReactNode; title: string; desc: string }

const STEPS: Step[] = [
  { icon: <Cursor />, title: 'Pick an area', desc: 'Explore the 3 labeled areas.' },
  { icon: <Expand />, title: 'Open a piece', desc: 'Click once you’re zoomed in.' },
  { icon: <Menu />, title: 'Top menu', desc: 'Jump to any section.' },
  { icon: <Back />, title: 'Go back', desc: 'Back, Esc, or click away.' },
]

export default function NavGuide() {
  const entered = useUiStore((s) => s.entered)
  const isUser = useViewStore((s) => s.mode) === 'user'
  const section = useReaderStore((s) => s.section)
  const [open, setOpen] = useState(true)

  // Only in the visitor-facing view, after entering, and not while a reader covers the screen.
  if (!entered || !isUser || section) return null

  return (
    <div className="fixed left-5 top-1/2 z-[55] -translate-y-1/2">
      {open ? (
        <div className="guide-in flex flex-col items-start gap-2">
          {/* standalone hide control — its own entity, above the box */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Hide guide"
            className="flex items-center gap-1.5 border border-white/20 bg-arizona/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-200 backdrop-blur-xl transition hover:border-accent/60 hover:bg-white/10 hover:text-white"
          >
            <EyeOff /> Hide Me
          </button>

          {/* the guide box */}
          <div className="relative w-[244px] border border-white/12 bg-arizona/85 backdrop-blur-xl">
            <Corners size="h-3 w-3" />
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5 text-accent">
              <Compass />
              <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-white">Help me navigate</span>
            </div>
            <ul className="flex flex-col p-1.5">
              {STEPS.map((s, i) => (
                <li key={i} className="flex items-center gap-3 px-2 py-1.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/12 bg-white/[0.03] text-slate-300">
                    {s.icon}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[12.5px] font-semibold leading-tight text-slate-100">{s.title}</span>
                    <span className="font-mono text-[10.5px] leading-snug text-slate-500">{s.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Show navigation guide"
          className="guide-in flex items-center gap-2 border border-white/12 bg-arizona/85 px-3 py-2.5 text-slate-300 backdrop-blur-xl transition hover:border-white/20 hover:text-white"
        >
          <span className="text-accent">
            <Compass />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">Guide</span>
        </button>
      )}
    </div>
  )
}
