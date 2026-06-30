import { create } from 'zustand'

/**
 * Camera/view mode.
 * - 'edit'  → free orbit camera (Garage-style: left-drag pan, right-drag rotate, scroll dolly, no clamps).
 *             Used while building/QC-ing the scene.
 * - 'user'  → the locked isometric "user view" (what a site visitor sees; static framing).
 */
export type ViewMode = 'edit' | 'user'

interface ViewState {
  mode: ViewMode
  setMode: (m: ViewMode) => void
}

export const useViewStore = create<ViewState>()((set) => ({
  // Default to the visitor-facing User view so the site presents as a website on load.
  // The Edit/User toggle stays available for building/inspecting the scene.
  mode: 'user',
  setMode: (mode) => set({ mode }),
}))
