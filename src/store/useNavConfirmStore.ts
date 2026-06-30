import { create } from 'zustand'

/**
 * Pending in-app navigation awaiting confirmation. Area-jump links inside the reader panels
 * (About/Bio, Professional Evolution) call `request(id)` instead of navigating straight away;
 * the <NavConfirm/> modal (mounted in Overlay) then asks before actually opening that section,
 * so a stray click doesn't fling the visitor to the wrong area. `confirm`/`cancel` clear it.
 */
interface NavConfirmState {
  pendingId: string | null
  request: (id: string) => void
  clear: () => void
}

export const useNavConfirmStore = create<NavConfirmState>()((set) => ({
  pendingId: null,
  request: (id) => set({ pendingId: id }),
  clear: () => set({ pendingId: null }),
}))
