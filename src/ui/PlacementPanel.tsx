import { useEffect, useState } from 'react'
import { usePlacementStore, type SlotTransform } from '../store/usePlacementStore'
import { useViewStore } from '../store/useViewStore'

const fmt = (n: number) => {
  const r = Math.round(n * 1000) / 1000
  return Object.is(r, -0) ? 0 : r
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

function SliderRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums text-slate-400">{fmt(value)}</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="h-6 w-6 shrink-0 rounded bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => onChange(clamp(value - step))} aria-label={`decrease ${label}`}>−</button>
        <input type="range" className="h-1 w-full accent-sky-400" min={min} max={max} step={step} value={value} onChange={(e) => onChange(clamp(parseFloat(e.target.value)))} />
        <button className="h-6 w-6 shrink-0 rounded bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => onChange(clamp(value + step))} aria-label={`increase ${label}`}>+</button>
      </div>
    </div>
  )
}

/** Placement editor — visible in Edit view. Same tool as the Kitchen/Garage rooms. */
export default function PlacementPanel() {
  const editMode = useViewStore((s) => s.mode) === 'edit'
  const setMode = useViewStore((s) => s.setMode)

  const slots = usePlacementStore((s) => s.slots)
  const activeSlotId = usePlacementStore((s) => s.activeSlotId)
  const dragMode = usePlacementStore((s) => s.dragMode)
  const clickSelect = usePlacementStore((s) => s.clickSelect)
  const setActiveSlot = usePlacementStore((s) => s.setActiveSlot)
  const setDragMode = usePlacementStore((s) => s.setDragMode)
  const setClickSelect = usePlacementStore((s) => s.setClickSelect)
  const setLocked = usePlacementStore((s) => s.setLocked)
  const setPosition = usePlacementStore((s) => s.setPosition)
  const setRotation = usePlacementStore((s) => s.setRotation)
  const setScale = usePlacementStore((s) => s.setScale)
  const revert = usePlacementStore((s) => s.revert)
  const revertPoints = usePlacementStore((s) => s.revertPoints)

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [copied, setCopied] = useState(false)
  const [slidersOpen, setSlidersOpen] = useState(false)

  const slot: SlotTransform | undefined = activeSlotId ? slots[activeSlotId] : undefined
  const slotIds = Object.keys(slots).sort()

  // While drag mode is on, the wheel raises / lowers the active item's Y.
  useEffect(() => {
    if (!dragMode || !activeSlotId) return
    const onWheel = (e: WheelEvent) => {
      const s = usePlacementStore.getState().slots[activeSlotId]
      if (!s || s.locked) return
      e.preventDefault()
      const dir = e.deltaY < 0 ? 1 : -1
      const y = Math.min(3, Math.max(0, s.position[1] + dir * 0.02))
      setPosition(activeSlotId, [s.position[0], y, s.position[2]])
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [dragMode, activeSlotId, setPosition])

  if (!editMode) return null

  const save = async () => {
    setSaveState('saving')
    try {
      const res = await fetch('/__placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usePlacementStore.getState().slots),
      })
      if (!res.ok) throw new Error(String(res.status))
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('failed')
      window.setTimeout(() => setSaveState('idle'), 2500)
    }
  }

  const copyLine = async () => {
    if (!slot) return
    const [x, y, z] = slot.position
    const rot = `[${fmt(slot.rotationX ?? 0)}, ${fmt(slot.rotationY)}, ${fmt(slot.rotationZ ?? 0)}]`
    const line = `position: [${fmt(x)}, ${fmt(y)}, ${fmt(z)}], rotation: ${rot}, scale: ${fmt(slot.scale)}`
    try {
      await navigator.clipboard.writeText(line)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const saveLabel = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : saveState === 'failed' ? 'Save failed' : 'Save to disk'
  const saveClass = saveState === 'saved' ? 'bg-emerald-500' : saveState === 'failed' ? 'bg-red-500' : saveState === 'saving' ? 'cursor-not-allowed bg-sky-400/60' : 'bg-sky-500 hover:bg-sky-400'

  return (
    <div className="fixed right-4 top-4 z-[80] max-h-[calc(100vh-2rem)] w-72 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200">Placement editor</h2>
        <button onClick={() => { setDragMode(false); setMode('user') }} className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/20">Done</button>
      </div>

      <label className="mb-1 block text-xs text-slate-400">Item</label>
      <select className="mb-3 w-full rounded bg-slate-800 px-2 py-1.5 text-sm text-slate-100 outline-none ring-1 ring-white/10" value={activeSlotId ?? ''} onChange={(e) => setActiveSlot(e.target.value || null)}>
        <option value="">{slotIds.length ? 'Select an item…' : 'No items yet'}</option>
        {slotIds.map((id) => (<option key={id} value={id}>{id}</option>))}
      </select>

      <button onClick={() => setClickSelect(!clickSelect)} className={`mb-3 flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition ${clickSelect ? 'bg-sky-500/90 text-white hover:bg-sky-500' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
        <span>Click to select{clickSelect ? ' — click any item' : ''}</span>
        <span className="text-xs font-semibold tracking-wide">{clickSelect ? 'ON' : 'OFF'}</span>
      </button>

      {slot && activeSlotId ? (
        <>
          <button onClick={() => setDragMode(!dragMode)} className={`mb-2 w-full rounded px-3 py-2 text-sm font-medium transition ${dragMode ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'}`}>
            {dragMode ? 'Drag mode: ON — camera frozen (wheel = up/down)' : 'Drag to move'}
          </button>
          <button onClick={() => setLocked(activeSlotId, !slot.locked)} className={`mb-2 w-full rounded px-3 py-2 text-sm font-medium transition ${slot.locked ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'}`}>
            {slot.locked ? '🔒 Locked — click to unlock' : '🔓 Lock in place'}
          </button>
          <button onClick={() => revert(activeSlotId)} disabled={!revertPoints[activeSlotId]} className={`mb-3 w-full rounded px-3 py-2 text-sm font-medium transition ${revertPoints[activeSlotId] ? 'bg-indigo-500/90 text-white hover:bg-indigo-500' : 'cursor-not-allowed bg-slate-700/50 text-slate-500'}`}>↩ Revert to last position</button>

          <div className="mb-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Scale</p>
            <SliderRow label="Uniform" value={slot.scale} min={0.02} max={3.0} step={0.01} onChange={(v) => setScale(activeSlotId, v)} />
            <div className="mt-1 flex gap-1">
              {[0.5, 0.8, 1, 1.25, 1.5].map((f) => (
                <button key={f} onClick={() => setScale(activeSlotId, Math.round(slot.scale * f * 1000) / 1000)} className="flex-1 rounded bg-slate-700 px-1 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-600" title={`×${f} current scale`}>×{f}</button>
              ))}
            </div>
          </div>

          <div className="mb-3 border-t border-white/10 pt-3">
            <button onClick={() => setSlidersOpen((o) => !o)} aria-expanded={slidersOpen} className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-200">
              <span>Fine adjust · position / rotation</span>
              <span className="text-sm text-slate-500">{slidersOpen ? '▾' : '▸'}</span>
            </button>
            {slidersOpen && (
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Position</p>
                <SliderRow label="X" value={slot.position[0]} min={-3} max={3} step={0.01} onChange={(v) => setPosition(activeSlotId, [v, slot.position[1], slot.position[2]])} />
                <SliderRow label="Y" value={slot.position[1]} min={0} max={3} step={0.01} onChange={(v) => setPosition(activeSlotId, [slot.position[0], v, slot.position[2]])} />
                <SliderRow label="Z" value={slot.position[2]} min={-3} max={3} step={0.01} onChange={(v) => setPosition(activeSlotId, [slot.position[0], slot.position[1], v])} />
                <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Rotation</p>
                <SliderRow label="X" value={slot.rotationX ?? 0} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => setRotation(activeSlotId, 'x', v)} />
                <SliderRow label="Y" value={slot.rotationY} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => setRotation(activeSlotId, 'y', v)} />
                <SliderRow label="Z" value={slot.rotationZ ?? 0} min={-Math.PI} max={Math.PI} step={0.01} onChange={(v) => setRotation(activeSlotId, 'z', v)} />
              </div>
            )}
          </div>

          <button onClick={copyLine} className="mb-2 w-full rounded bg-slate-700 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600">{copied ? 'Copied!' : 'Copy values (for layout.ts)'}</button>
        </>
      ) : (
        <p className="mb-3 text-xs leading-relaxed text-slate-500">Select an item (or turn on “Click to select” and click one in the scene) to edit its placement.</p>
      )}

      <button onClick={save} disabled={saveState === 'saving'} className={`w-full rounded px-3 py-2 text-sm font-semibold text-white transition ${saveClass}`}>{saveLabel}</button>
    </div>
  )
}
