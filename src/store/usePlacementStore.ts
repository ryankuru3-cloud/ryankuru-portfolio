import { create } from 'zustand'
import placementsData from '../config/placements.json'

/**
 * Placement editor state (Edit view only) — the same tool used in the Kitchen/Garage rooms.
 * Each fixture registers a "slot"; the editor drags / sliders / scales it live, and "Save to
 * disk" pretty-writes the whole map to src/config/placements.json (which seeds the slots and
 * overrides the FIXTURES defaults in config/layout.ts). editMode is derived from the Edit/User
 * view toggle (useViewStore), so it isn't stored here.
 */
export interface SlotTransform {
  position: [number, number, number]
  rotationX?: number
  rotationY: number
  rotationZ?: number
  scale: number
  locked?: boolean
}

type Axis = 'x' | 'y' | 'z'

interface PlacementState {
  slots: Record<string, SlotTransform>
  activeSlotId: string | null
  dragMode: boolean
  clickSelect: boolean
  /** Per-slot snapshot from before the latest edit gesture (one-step undo). */
  revertPoints: Record<string, SlotTransform>

  setPosition: (id: string, position: [number, number, number]) => void
  setRotation: (id: string, axis: Axis, value: number) => void
  setScale: (id: string, scale: number) => void
  setLocked: (id: string, locked: boolean) => void
  setActiveSlot: (id: string | null) => void
  setDragMode: (value: boolean) => void
  setClickSelect: (value: boolean) => void
  revert: (id: string) => void
  registerSlot: (id: string, initial: SlotTransform) => void
}

const initialSlots = placementsData as Record<string, SlotTransform>

// Coalesce a continuous gesture (drag / slider sweep) into ONE revert point.
const GESTURE_GAP_MS = 500
const lastEditTs: Record<string, number> = {}
function captureRevert(
  current: Record<string, SlotTransform>,
  revertPoints: Record<string, SlotTransform>,
  id: string,
): Record<string, SlotTransform> {
  const now = Date.now()
  const prev = lastEditTs[id] ?? 0
  lastEditTs[id] = now
  if (now - prev > GESTURE_GAP_MS && current[id]) {
    return { ...revertPoints, [id]: { ...current[id] } }
  }
  return revertPoints
}

export const usePlacementStore = create<PlacementState>()((set) => ({
  slots: { ...initialSlots },
  activeSlotId: null,
  dragMode: false,
  clickSelect: false,
  revertPoints: {},

  setPosition: (id, position) =>
    set((s) => ({
      revertPoints: captureRevert(s.slots, s.revertPoints, id),
      slots: { ...s.slots, [id]: { ...s.slots[id], position } },
    })),
  setRotation: (id, axis, value) =>
    set((s) => {
      const key = axis === 'x' ? 'rotationX' : axis === 'z' ? 'rotationZ' : 'rotationY'
      return {
        revertPoints: captureRevert(s.slots, s.revertPoints, id),
        slots: { ...s.slots, [id]: { ...s.slots[id], [key]: value } },
      }
    }),
  setScale: (id, scale) =>
    set((s) => ({
      revertPoints: captureRevert(s.slots, s.revertPoints, id),
      slots: { ...s.slots, [id]: { ...s.slots[id], scale } },
    })),
  setLocked: (id, locked) => set((s) => ({ slots: { ...s.slots, [id]: { ...s.slots[id], locked } } })),
  setActiveSlot: (id) => set({ activeSlotId: id }),
  setDragMode: (value) => set({ dragMode: value }),
  setClickSelect: (value) => set({ clickSelect: value }),
  revert: (id) =>
    set((s) => {
      const rp = s.revertPoints[id]
      if (!rp) return s
      const cur = s.slots[id]
      const nextRevert = { ...s.revertPoints }
      delete nextRevert[id]
      lastEditTs[id] = 0
      return { slots: { ...s.slots, [id]: { ...rp, locked: cur?.locked } }, revertPoints: nextRevert }
    }),
  registerSlot: (id, initial) => set((s) => (s.slots[id] ? s : { slots: { ...s.slots, [id]: initial } })),
}))

// On HMR of placements.json, merge it in so a "Save to disk" goes live without a reload.
if (import.meta.hot) {
  import.meta.hot.accept('../config/placements.json', (mod) => {
    const next = (mod as { default?: Record<string, SlotTransform> })?.default ?? {}
    usePlacementStore.setState((s) => ({ slots: { ...s.slots, ...next } }))
  })
}
