import { create } from 'zustand'

/**
 * Which "area" the camera is currently zoomed into (null = the room lobby).
 * Set by clicking a zone anchor in User view; cleared by Back / Esc / clicking
 * the background, or when toggling camera modes.
 */
interface ZoomState {
  zone: string | null
  setZone: (z: string | null) => void
  // The area the entry tour is currently dollied into (null when not touring). Lets in-world
  // props (e.g. the desk chair) react to the cinematic tour the same way they react to a real
  // click-zoom, even though the tour never sets `zone`.
  previewZone: string | null
  setPreviewZone: (z: string | null) => void
}

export const useZoomStore = create<ZoomState>()((set) => ({
  zone: null,
  setZone: (zone) => set({ zone }),
  previewZone: null,
  setPreviewZone: (previewZone) => set({ previewZone }),
}))
