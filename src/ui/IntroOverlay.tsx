import { useEffect, useRef, type ReactNode } from 'react'
import { PERSONA } from '../config/content'
import { useUiStore } from '../store/useUiStore'
import { useViewStore } from '../store/useViewStore'
import Corners from './hud/Corners'

/**
 * Full-screen landing / value-prop shown once the scene is ready, before the visitor enters.
 * A flat dark canvas where detailed, full-color finance / developer / health objects drift in
 * space across three depth tiers and only get pushed aside when the cursor crosses them (no
 * global mouse-tracking), behind the centered pitch. Delivers the same message as the old card; dismissed
 * by Step Inside, clicking anywhere, or Esc. User view only. Honors prefers-reduced-motion.
 */

type Obj = { x: number; y: number; tier: 0 | 1 | 2; kind: string; size: number }

// Floating field — detailed, full-color objects from the three worlds that describe Ryan
// (finance / developer / health), placed around the centered hero. Each icon carries its own
// palette so the field reads as real items, not grey line glyphs.
const OBJECTS: Obj[] = [
  // finance
  { x: 13, y: 19, tier: 2, kind: 'area', size: 60 },
  { x: 86, y: 15, tier: 2, kind: 'candles', size: 56 },
  { x: 21, y: 44, tier: 1, kind: 'bars', size: 48 },
  { x: 83, y: 46, tier: 2, kind: 'donut', size: 52 },
  { x: 8, y: 64, tier: 1, kind: 'coin', size: 46 },
  { x: 92, y: 70, tier: 1, kind: 'trend', size: 48 },
  // things that mean something to Ryan — school + the tools he works in
  { x: 50, y: 8, tier: 2, kind: 'arizona', size: 60 },
  { x: 31, y: 13, tier: 2, kind: 'claude', size: 48 },
  { x: 63, y: 17, tier: 1, kind: 'excel', size: 46 },
  // developer / claude-code
  { x: 16, y: 81, tier: 2, kind: 'codewin', size: 58 },
  { x: 6, y: 34, tier: 1, kind: 'terminal', size: 50 },
  { x: 95, y: 53, tier: 1, kind: 'git', size: 44 },
  { x: 72, y: 85, tier: 1, kind: 'laptop', size: 56 },
  // AI & coding
  { x: 94, y: 39, tier: 2, kind: 'neuralnet', size: 54 },
  { x: 4, y: 74, tier: 1, kind: 'chip', size: 48 },
  { x: 25, y: 27, tier: 2, kind: 'robot', size: 48 },
  { x: 61, y: 89, tier: 1, kind: 'brackets', size: 46 },
  { x: 38, y: 27, tier: 0, kind: 'braces', size: 42 },
  { x: 90, y: 63, tier: 1, kind: 'chatai', size: 46 },
  // health / fitness
  { x: 12, y: 52, tier: 2, kind: 'ecg', size: 60 },
  { x: 88, y: 84, tier: 1, kind: 'heart', size: 46 },
  { x: 27, y: 86, tier: 1, kind: 'dumbbell', size: 50 },
  { x: 78, y: 30, tier: 0, kind: 'bottle', size: 42 },
  { x: 50, y: 93, tier: 1, kind: 'flame', size: 42 },
  { x: 40, y: 90, tier: 2, kind: 'rings', size: 50 },
  // center fill — generic / non-unique symbols behind the copy (auto-dimmed by inTextBand)
  { x: 35, y: 41, tier: 1, kind: 'g-percent', size: 52 },
  { x: 66, y: 41, tier: 1, kind: 'g-plus', size: 44 },
  { x: 50, y: 46, tier: 1, kind: 'bars', size: 40 },
  { x: 34, y: 56, tier: 1, kind: 'g-dollar', size: 50 },
  { x: 66, y: 56, tier: 1, kind: 'candles', size: 40 },
  { x: 45, y: 64, tier: 1, kind: 'g-times', size: 42 },
  { x: 58, y: 64, tier: 1, kind: 'g-eq', size: 44 },
]

const TIER_OP = [0.6, 0.82, 1]
// Objects that sit in the central band (behind the hero copy) fade way back so the words stay
// legible — that's where the generic, non-unique fillers live, to fill out the screen.
const inTextBand = (o: Obj) => Math.abs(o.x - 50) < 22 && o.y > 34 && o.y < 71
const opOf = (o: Obj) => (inTextBand(o) ? 0.16 : TIER_OP[o.tier])

function Glyph({ kind, size }: { kind: string; size: number }) {
  const svg = (children: ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {children}
    </svg>
  )
  // generic typographic fillers (math/finance/code symbols) for the center band
  if (kind.startsWith('g-')) {
    const map: Record<string, [string, string]> = {
      'g-percent': ['%', '#60a5fa'],
      'g-dollar': ['$', '#34d399'],
      'g-plus': ['+', '#a78bfa'],
      'g-times': ['×', '#f87171'],
      'g-eq': ['=', '#56d4dd'],
    }
    const [ch, color] = map[kind] ?? ['·', '#9fb8d8']
    return <span style={{ fontSize: size, lineHeight: 1, fontWeight: 600, color }}>{ch}</span>
  }
  switch (kind) {
    // ---- finance ----
    case 'area':
      return svg(
        <g>
          <path d="M4 25 L11 16 L16 19 L22 11 L28 15 L28 26 L4 26 Z" fill="#3b82f6" fillOpacity="0.32" />
          <polyline points="4,25 11,16 16,19 22,11 28,15" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="11" r="2" fill="#bfdbfe" />
          <line x1="4" y1="26" x2="28" y2="26" stroke="#33425c" strokeWidth="1.2" strokeLinecap="round" />
        </g>,
      )
    case 'candles':
      return svg(
        <g>
          <line x1="3" y1="28" x2="29" y2="28" stroke="#33425c" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="8" y1="7" x2="8" y2="22" stroke="#34d399" strokeWidth="1.5" />
          <rect x="5.5" y="10" width="5" height="9" rx="1" fill="#34d399" />
          <line x1="16" y1="5" x2="16" y2="25" stroke="#f87171" strokeWidth="1.5" />
          <rect x="13.5" y="9" width="5" height="11" rx="1" fill="#f87171" />
          <line x1="24" y1="9" x2="24" y2="23" stroke="#34d399" strokeWidth="1.5" />
          <rect x="21.5" y="12" width="5" height="7" rx="1" fill="#34d399" />
        </g>,
      )
    case 'bars':
      return svg(
        <g>
          <line x1="4" y1="27" x2="28" y2="27" stroke="#33425c" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="5" y="18" width="4.5" height="9" rx="1" fill="#60a5fa" />
          <rect x="11.5" y="13" width="4.5" height="14" rx="1" fill="#38bdf8" />
          <rect x="18" y="15" width="4.5" height="12" rx="1" fill="#2dd4bf" />
          <rect x="24.5" y="8" width="4.5" height="19" rx="1" fill="#34d399" />
        </g>,
      )
    case 'donut':
      return svg(
        <g transform="rotate(-90 16 16)" fill="none" strokeWidth="6">
          <circle cx="16" cy="16" r="10" stroke="#1e2a3d" />
          <circle cx="16" cy="16" r="10" stroke="#60a5fa" strokeDasharray="20 42.8" />
          <circle cx="16" cy="16" r="10" stroke="#34d399" strokeDasharray="16 46.8" strokeDashoffset="-20" />
          <circle cx="16" cy="16" r="10" stroke="#fbbf3c" strokeDasharray="14 48.8" strokeDashoffset="-36" />
          <circle cx="16" cy="16" r="10" stroke="#f87171" strokeDasharray="12.8 50" strokeDashoffset="-50" />
        </g>,
      )
    case 'coin':
      return svg(
        <g>
          <circle cx="16" cy="16" r="12" fill="#f5c451" />
          <circle cx="16" cy="16" r="12" fill="none" stroke="#d4a32c" strokeWidth="1.6" />
          <circle cx="16" cy="16" r="9" fill="none" stroke="#e3b440" strokeWidth="1.2" />
          <text x="16" y="20.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#9a771c">$</text>
        </g>,
      )
    case 'trend':
      return svg(
        <g fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,23 12,15 17,19 27,8" />
          <polyline points="20,8 27,8 27,15" />
        </g>,
      )
    case 'arizona':
      // Ryan's own University of Arizona logo asset (a student, school project) — shown as a
      // rounded badge so its navy backdrop reads as intentional. We display HIS file, not a
      // recreated trademark. Path matches GalleryWall's LOGO_URL.
      return (
        <span
          style={{
            display: 'block',
            width: size,
            height: size,
            borderRadius: 13,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 8px 20px -10px rgba(0,0,0,0.7)',
          }}
        >
          <img
            src="/textures/arizona-logo.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </span>
      )
    // ---- developer / claude-code ----
    case 'codewin':
      return svg(
        <g>
          <rect x="3" y="5" width="26" height="22" rx="3" fill="#111a27" stroke="#2b3a4f" strokeWidth="1.2" />
          <line x1="3" y1="11" x2="29" y2="11" stroke="#2b3a4f" strokeWidth="1" />
          <circle cx="7" cy="8" r="1.3" fill="#f87171" />
          <circle cx="11" cy="8" r="1.3" fill="#fbbf3c" />
          <circle cx="15" cy="8" r="1.3" fill="#34d399" />
          <rect x="7" y="14.5" width="9" height="2" rx="1" fill="#a78bfa" />
          <rect x="18" y="14.5" width="6" height="2" rx="1" fill="#56d4dd" />
          <rect x="9" y="18.5" width="7" height="2" rx="1" fill="#56d4dd" />
          <rect x="18" y="18.5" width="5" height="2" rx="1" fill="#34d399" />
          <rect x="7" y="22.5" width="6" height="2" rx="1" fill="#fbbf3c" />
        </g>,
      )
    case 'terminal':
      return svg(
        <g>
          <rect x="3" y="6" width="26" height="20" rx="3" fill="#0c1420" stroke="#2b3a4f" strokeWidth="1.2" />
          <polyline points="8,13 12,16 8,19" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="17.6" width="7" height="2" rx="1" fill="#34d399" />
          <rect x="22.5" y="12.5" width="2.4" height="6.5" rx="0.6" fill="#34d399" fillOpacity="0.6" />
        </g>,
      )
    case 'git':
      return svg(
        <g fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 8 v16" />
          <path d="M9 13 a6 6 0 0 0 6 6 h1 a5 5 0 0 0 5 -5" />
          <circle cx="9" cy="7" r="2.6" fill="#1a1330" />
          <circle cx="9" cy="25" r="2.6" fill="#1a1330" />
          <circle cx="22" cy="9" r="2.6" fill="#1a1330" />
        </g>,
      )
    case 'claude': {
      // Claude / Claude Code spark — the radial sunburst mark, in Anthropic's coral.
      const rays = []
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6
        rays.push(
          <line
            key={k}
            x1={(16 + Math.cos(a) * 4.6).toFixed(2)}
            y1={(16 + Math.sin(a) * 4.6).toFixed(2)}
            x2={(16 + Math.cos(a) * 13.6).toFixed(2)}
            y2={(16 + Math.sin(a) * 13.6).toFixed(2)}
            stroke="#d97757"
            strokeWidth="2.5"
            strokeLinecap="round"
          />,
        )
      }
      return svg(<g>{rays}</g>)
    }
    case 'laptop':
      return svg(
        <g>
          <rect x="6" y="6" width="20" height="14" rx="1.6" fill="#1a2533" stroke="#3a4a5f" strokeWidth="1.2" />
          <rect x="8.5" y="9" width="6.5" height="1.8" rx="0.9" fill="#a78bfa" />
          <rect x="8.5" y="12.2" width="9.5" height="1.8" rx="0.9" fill="#56d4dd" />
          <rect x="8.5" y="15.4" width="5" height="1.8" rx="0.9" fill="#34d399" />
          <path d="M3 24 L29 24 L26.5 20.5 L5.5 20.5 Z" fill="#9aa7b8" />
        </g>,
      )
    case 'excel':
      // Microsoft Excel mark — green tile + white "X" with a hint of a spreadsheet panel.
      return svg(
        <g>
          <rect x="4" y="5" width="24" height="22" rx="3.5" fill="#1f8a4e" />
          <rect x="4" y="5" width="11" height="22" rx="3.5" fill="#1a7544" />
          <rect x="4" y="5" width="24" height="22" rx="3.5" fill="none" stroke="#14512f" strokeWidth="1" />
          <path d="M10.5 11 L21.5 21 M21.5 11 L10.5 21" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
        </g>,
      )
    // ---- AI & coding ----
    case 'neuralnet':
      return svg(
        <g>
          <g stroke="#52617e" strokeWidth="1">
            <line x1="7" y1="9" x2="16" y2="12" />
            <line x1="7" y1="9" x2="16" y2="20" />
            <line x1="7" y1="16" x2="16" y2="12" />
            <line x1="7" y1="16" x2="16" y2="20" />
            <line x1="7" y1="23" x2="16" y2="12" />
            <line x1="7" y1="23" x2="16" y2="20" />
            <line x1="16" y1="12" x2="25" y2="16" />
            <line x1="16" y1="20" x2="25" y2="16" />
          </g>
          <circle cx="7" cy="9" r="2.4" fill="#56d4dd" />
          <circle cx="7" cy="16" r="2.4" fill="#56d4dd" />
          <circle cx="7" cy="23" r="2.4" fill="#56d4dd" />
          <circle cx="16" cy="12" r="2.6" fill="#a78bfa" />
          <circle cx="16" cy="20" r="2.6" fill="#a78bfa" />
          <circle cx="25" cy="16" r="2.8" fill="#fb8c5a" />
        </g>,
      )
    case 'chip':
      return svg(
        <g>
          <g stroke="#7c8aa3" strokeWidth="1.6" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="7" />
            <line x1="16" y1="4" x2="16" y2="7" />
            <line x1="21" y1="4" x2="21" y2="7" />
            <line x1="11" y1="25" x2="11" y2="28" />
            <line x1="16" y1="25" x2="16" y2="28" />
            <line x1="21" y1="25" x2="21" y2="28" />
            <line x1="4" y1="11" x2="7" y2="11" />
            <line x1="4" y1="16" x2="7" y2="16" />
            <line x1="4" y1="21" x2="7" y2="21" />
            <line x1="25" y1="11" x2="28" y2="11" />
            <line x1="25" y1="16" x2="28" y2="16" />
            <line x1="25" y1="21" x2="28" y2="21" />
          </g>
          <rect x="7" y="7" width="18" height="18" rx="2.5" fill="#1c2940" stroke="#3a4a66" strokeWidth="1.2" />
          <rect x="11" y="11" width="10" height="10" rx="1.5" fill="none" stroke="#56d4dd" strokeWidth="1.3" />
          <text x="16" y="18.6" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#56d4dd">AI</text>
        </g>,
      )
    case 'robot':
      return svg(
        <g>
          <line x1="16" y1="2.5" x2="16" y2="6" stroke="#7c8aa3" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="2.5" r="1.6" fill="#fb8c5a" />
          <line x1="4" y1="13" x2="4" y2="17" stroke="#3f5274" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="28" y1="13" x2="28" y2="17" stroke="#3f5274" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="6" y="6" width="20" height="16" rx="4.5" fill="#26344d" stroke="#3f5274" strokeWidth="1.2" />
          <circle cx="12" cy="13.5" r="2.4" fill="#56d4dd" />
          <circle cx="20" cy="13.5" r="2.4" fill="#56d4dd" />
          <rect x="11" y="18" width="10" height="1.8" rx="0.9" fill="#7c8aa3" />
        </g>,
      )
    case 'brackets':
      return svg(
        <g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10,9 4,16 10,23" stroke="#56d4dd" />
          <polyline points="22,9 28,16 22,23" stroke="#56d4dd" />
          <line x1="18.5" y1="7" x2="13.5" y2="25" stroke="#a78bfa" />
        </g>,
      )
    case 'braces':
      return svg(
        <g fill="none" stroke="#fbbf3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 6 c-3 0 -3 2.5 -3 5 c0 2 -1 3 -2 3 c1 0 2 1 2 3 c0 2.5 0 5 3 5" />
          <path d="M19 6 c3 0 3 2.5 3 5 c0 2 1 3 2 3 c-1 0 -2 1 -2 3 c0 2.5 0 5 -3 5" />
        </g>,
      )
    case 'chatai':
      return svg(
        <g>
          <path d="M6 6 h20 a2.5 2.5 0 0 1 2.5 2.5 v9 a2.5 2.5 0 0 1 -2.5 2.5 h-12 l-5.5 4.5 v-4.5 h-2.5 a2.5 2.5 0 0 1 -2.5 -2.5 v-9 a2.5 2.5 0 0 1 2.5 -2.5 Z" fill="#241d49" stroke="#5b4bb0" strokeWidth="1.2" />
          <path d="M16 9.5 C16.6 12.8 18.4 14.6 21.5 15.2 C18.4 15.8 16.6 17.6 16 20.9 C15.4 17.6 13.6 15.8 10.5 15.2 C13.6 14.6 15.4 12.8 16 9.5 Z" fill="#fb8c5a" />
        </g>,
      )
    // ---- health / fitness ----
    case 'ecg':
      return svg(
        <g>
          <rect x="2" y="7" width="28" height="18" rx="2.5" fill="#0c1a17" stroke="#1f5a4d" strokeWidth="1.2" />
          <polyline points="5,17 10,17 12.5,11 16,23 19,14 21,17 27,17" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>,
      )
    case 'heart':
      return svg(
        <g>
          <path d="M16 27 C16 27 4 19.5 4 11.5 C4 7.4 7.2 5 10.5 5 C13 5 15 6.4 16 8.6 C17 6.4 19 5 21.5 5 C24.8 5 28 7.4 28 11.5 C28 19.5 16 27 16 27 Z" fill="#f43f5e" />
          <path d="M10.5 8.4 C8.7 8.4 7.2 9.7 7.1 11.6" fill="none" stroke="#ff9aab" strokeWidth="1.6" strokeLinecap="round" />
        </g>,
      )
    case 'dumbbell':
      return svg(
        <g>
          <rect x="13" y="14" width="6" height="4" fill="#cbd5e1" />
          <rect x="9.5" y="11" width="3" height="10" rx="1" fill="#94a3b8" />
          <rect x="6" y="9" width="3.2" height="14" rx="1.2" fill="#f87171" />
          <rect x="19.5" y="11" width="3" height="10" rx="1" fill="#94a3b8" />
          <rect x="22.8" y="9" width="3.2" height="14" rx="1.2" fill="#f87171" />
        </g>,
      )
    case 'bottle':
      return svg(
        <g>
          <rect x="13" y="3" width="6" height="3.5" rx="1" fill="#1d4ed8" />
          <rect x="10.5" y="6" width="11" height="23" rx="4.5" fill="#38bdf8" />
          <path d="M10.5 18 v6.5 a4.5 4.5 0 0 0 4.5 4.5 h2 a4.5 4.5 0 0 0 4.5 -4.5 v-6.5 Z" fill="#0ea5e9" />
          <rect x="10.5" y="6" width="11" height="23" rx="4.5" fill="none" stroke="#0c87c4" strokeWidth="1.1" />
        </g>,
      )
    case 'flame':
      return svg(
        <g>
          <path d="M16 29 C22 29 26 25 26 19.5 C26 13 21 11 22 5 C18 7 13 11.5 13 17 C13 18.8 11.5 20 10 20 C9 22 9.5 25 12 27 C13.2 28.2 14.6 29 16 29 Z" fill="#fb923c" />
          <path d="M16.5 29 C19.8 29 22 26.5 22 23.2 C22 19.7 19 18.4 19.6 14.6 C16.8 16.4 15.2 19 15.2 21.6 C15.2 23 16 23.8 16 23.8 C14.2 24.8 15 27.6 16.5 29 Z" fill="#fcd34d" />
        </g>,
      )
    case 'rings':
      return svg(
        <g transform="rotate(-90 16 16)" fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="16" cy="16" r="11" stroke="#3a1622" />
          <circle cx="16" cy="16" r="11" stroke="#fb2d55" strokeDasharray="52 17.1" />
          <circle cx="16" cy="16" r="7.5" stroke="#123322" />
          <circle cx="16" cy="16" r="7.5" stroke="#3ee37a" strokeDasharray="35 12.1" />
          <circle cx="16" cy="16" r="4" stroke="#0e2636" />
          <circle cx="16" cy="16" r="4" stroke="#36c5f4" strokeDasharray="17 8.1" />
        </g>,
      )
    default:
      return null
  }
}

export default function IntroOverlay() {
  const ready = useUiStore((s) => s.sceneReady)
  const entered = useUiStore((s) => s.entered)
  const setEntered = useUiStore((s) => s.setEntered)
  const isUser = useViewStore((s) => s.mode) === 'user'

  const rootRef = useRef<HTMLDivElement>(null)
  const elRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!ready || entered || !isUser) return
    const root = rootRef.current
    if (!root) return
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    // per-object motion params (deterministic from index → stable, no re-render churn)
    const P = OBJECTS.map((o, i) => ({
      ph: (i * 1.7) % (Math.PI * 2),
      sp: 0.22 + (i % 5) * 0.045,
      amp: [5, 9, 13][o.tier],
      rep: [14, 26, 42][o.tier],
      rx: 0,
      ry: 0,
    }))

    const ptr = { x: 0, y: 0, on: false }
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.on = true
    }
    const onLeave = () => (ptr.on = false)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)

    if (reduce) {
      elRefs.current.forEach((el) => el && (el.style.transform = 'translate(-50%,-50%)'))
      return () => {
        root.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerleave', onLeave)
      }
    }

    const R = 155
    let raf = 0
    let t0: number | null = null
    const frame = (ts: number) => {
      if (t0 == null) t0 = ts
      const t = (ts - t0) / 1000
      const r = root.getBoundingClientRect()
      for (let i = 0; i < OBJECTS.length; i++) {
        const el = elRefs.current[i]
        if (!el) continue
        const o = OBJECTS[i]
        const p = P[i]
        const cx = (o.x / 100) * r.width
        const cy = (o.y / 100) * r.height
        let txr = 0
        let tyr = 0
        if (ptr.on) {
          const dx = cx - ptr.x
          const dy = cy - ptr.y
          const d = Math.hypot(dx, dy)
          if (d < R && d > 0.01) {
            const f = 1 - d / R
            txr = (dx / d) * f * p.rep
            tyr = (dy / d) * f * p.rep
          }
        }
        p.rx += (txr - p.rx) * 0.12
        p.ry += (tyr - p.ry) * 0.12
        const ax = p.rx + Math.sin(t * p.sp + p.ph) * p.amp
        const ay = p.ry + Math.cos(t * p.sp * 0.9 + p.ph) * p.amp
        el.style.transform = `translate(-50%,-50%) translate(${ax.toFixed(1)}px,${ay.toFixed(1)}px)`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [ready, entered, isUser])

  if (!ready || entered || !isUser) return null

  return (
    <div
      ref={rootRef}
      className="reader-backdrop fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
      onClick={() => setEntered(true)}
      style={{
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        background: '#080c14',
      }}
    >
      <Corners />

      {/* floating object field */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {OBJECTS.map((o, i) => (
          <div
            key={i}
            ref={(el) => {
              elRefs.current[i] = el
            }}
            className="absolute flex items-center justify-center"
            style={{ left: `${o.x}%`, top: `${o.y}%`, opacity: opOf(o), transform: 'translate(-50%,-50%)', willChange: 'transform' }}
          >
            <Glyph kind={o.kind} size={o.size} />
          </div>
        ))}
      </div>

      {/* centered pitch */}
      <div className="relative z-10 px-6 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400">{PERSONA.intro.eyebrow}</p>
        <h1 className="mt-5 text-5xl font-medium uppercase tracking-[0.14em] text-white sm:text-6xl">{PERSONA.name}</h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] font-light leading-relaxed text-slate-300">{PERSONA.intro.subhead}</p>
        <button
          onClick={() => setEntered(true)}
          className="cta-pulse mt-11 inline-flex flex-col items-center gap-2.5 bg-transparent text-[15px] font-medium uppercase tracking-[0.34em] text-white transition-transform duration-300 hover:scale-[1.05]"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <span style={{ paddingLeft: '0.34em' }}>{PERSONA.intro.cta}</span>
          <span className="cta-nudge" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
        <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">{PERSONA.intro.helper}</p>
      </div>
    </div>
  )
}
