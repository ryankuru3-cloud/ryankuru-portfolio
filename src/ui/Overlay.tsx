import Reader from './Reader'
import NavConfirm from './NavConfirm'

/**
 * HTML overlay layer above the 3D canvas. The layer itself is click-through
 * (pointer-events:none); the Reader re-enables pointer events on itself when a section
 * is open. Empty (just the lobby) until a visitor opens a section. NavConfirm renders
 * above the Reader (z-80) to confirm in-app area-jump links.
 */
export default function Overlay() {
  return (
    <div className="overlay-layer">
      <Reader />
      <NavConfirm />
    </div>
  )
}
