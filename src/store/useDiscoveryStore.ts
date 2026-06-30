import { create } from 'zustand'

/**
 * Per-session "what has the visitor discovered yet" state, driving the affordance hints:
 *  - `visitedZones`  → an area stops glowing once its camera zoom has been entered once.
 *  - `openedItems`   → an in-area item stops floating once its reader has been opened once.
 * Not persisted: every fresh visit re-shows the guidance (each recruiter gets the hint).
 */
interface DiscoveryState {
  visitedZones: Record<string, boolean>
  markZoneVisited: (zone: string) => void
  openedItems: Record<string, boolean>
  markItemOpened: (id: string) => void
}

export const useDiscoveryStore = create<DiscoveryState>()((set) => ({
  visitedZones: {},
  markZoneVisited: (zone) =>
    set((s) => (s.visitedZones[zone] ? s : { visitedZones: { ...s.visitedZones, [zone]: true } })),
  openedItems: {},
  markItemOpened: (id) =>
    set((s) => (s.openedItems[id] ? s : { openedItems: { ...s.openedItems, [id]: true } })),
}))
