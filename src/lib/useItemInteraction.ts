import type { ThreeEvent } from '@react-three/fiber'
import { SECTIONS } from '../config/content'
import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'
import { useReaderStore } from '../store/useReaderStore'

/**
 * Two-step in-world interaction + the direct "jump" used by the side nav.
 *  - First click on an item (not yet in its zone) → camera dollies to that zone.
 *  - Second click (already in the zone) → opens that item's full-screen reader.
 * The side nav skips straight to a section via `goToSection` (dolly behind + open).
 */
export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: () => void
}

/** Dolly the camera to a section's area AND open its reader. Callable from anywhere. */
export function goToSection(id: string) {
  const section = SECTIONS[id]
  if (!section) return
  useZoomStore.getState().setZone(section.zone)
  useReaderStore.getState().open(id)
}

/** Pure two-step handler builder (no hooks) — safe to call inside a .map loop. */
export function itemHandlers(
  zone: string,
  section: string,
  currentZone: string | null,
  setZone: (z: string | null) => void,
  open: (id: string) => void,
): Handlers {
  return {
    onClick: (e) => {
      e.stopPropagation()
      if (currentZone !== zone) setZone(zone)
      else open(section)
    },
    onPointerOver: (e) => {
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto'
    },
  }
}

/** Hook form for a single in-world item (e.g. each bulletin paper). Inert in Edit view. */
export function useItemHandlers(zone: string, section: string): Handlers {
  const interactive = useViewStore((s) => s.mode) === 'user'
  const currentZone = useZoomStore((s) => s.zone)
  const setZone = useZoomStore((s) => s.setZone)
  const open = useReaderStore((s) => s.open)
  if (!interactive) return {}
  return itemHandlers(zone, section, currentZone, setZone, open)
}
