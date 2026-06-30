import { useEffect, useState } from 'react'
import { PERSONA } from '../config/content'
import { useUiStore } from '../store/useUiStore'
import Corners from './hud/Corners'

/**
 * Branded HUD loading screen. Covers the viewport until the scene is rendering AND a short
 * minimum has elapsed (so it never just flashes), then fades out and unmounts.
 */
export default function LoadingScreen() {
  const ready = useUiStore((s) => s.sceneReady)
  const [minDone, setMinDone] = useState(false)
  const [forced, setForced] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 1100)
    // safety net: never trap a visitor if the scene is slow to report ready
    const f = setTimeout(() => setForced(true), 8000)
    return () => {
      clearTimeout(t)
      clearTimeout(f)
    }
  }, [])

  const hidden = forced || (ready && minDone)
  useEffect(() => {
    if (!hidden) return
    const t = setTimeout(() => setGone(true), 520)
    return () => clearTimeout(t)
  }, [hidden])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-midnight transition-opacity duration-500 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative px-14 py-12 text-center">
        <Corners />
        <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-slate-500">Portfolio</p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.18em] text-white">{PERSONA.name}</h1>
        <div className="mx-auto mt-7 h-px w-60 overflow-hidden bg-white/10">
          <div className="loader-bar h-full w-1/3 bg-accent" />
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">Initializing environment</p>
      </div>
    </div>
  )
}
