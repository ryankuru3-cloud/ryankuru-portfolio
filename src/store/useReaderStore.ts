import { create } from 'zustand'
import { SECTIONS } from '../config/content'
import { useZoomStore } from './useZoomStore'

/**
 * Which section's full-screen reader is open (null = closed). Set by the second
 * click on an in-world item, or directly by the side nav. Cleared by ×, Esc, or a
 * backdrop click. The camera zoom (useZoomStore) is driven alongside this so the
 * room dollies behind whatever reader is open.
 */
interface ReaderState {
  section: string | null
  open: (id: string) => void
  close: () => void
}

export const useReaderStore = create<ReaderState>()((set) => ({
  section: null,
  open: (section) => set({ section }),
  close: () =>
    set((s) => {
      // Professional Evolution is a single-item area: closing its reader has nothing else to
      // browse in that zone, so pop the camera all the way back to the main room view (instead
      // of leaving it zoomed on the whiteboard). Other (multi-item) areas stay zoomed in.
      if (s.section && SECTIONS[s.section]?.zone === 'whiteboard') {
        useZoomStore.getState().setZone(null)
      }
      return { section: null }
    }),
}))
