import { create } from 'zustand'

/**
 * First-impression / chrome UI state: whether the 3D scene has rendered (drives the
 * loading screen), whether the visitor has dismissed the intro, and the label of the
 * clickable surface currently under the cursor (drives the hover tooltip).
 */
interface UiState {
  sceneReady: boolean
  setSceneReady: (v: boolean) => void
  entered: boolean
  setEntered: (v: boolean) => void
  hover: string | null
  setHover: (v: string | null) => void
}

export const useUiStore = create<UiState>()((set) => ({
  sceneReady: false,
  setSceneReady: (sceneReady) => set({ sceneReady }),
  entered: false,
  setEntered: (entered) => set({ entered }),
  hover: null,
  setHover: (hover) => set({ hover }),
}))

// Dev bridge for headless verification (mirrors window.__view / __zoom / __reader): lets a
// preview harness force first-impression state when the R3F renderer hasn't pumped frames.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __ui: typeof useUiStore }).__ui = useUiStore
}
