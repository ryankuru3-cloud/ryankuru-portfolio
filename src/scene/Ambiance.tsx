import { AMBIANCE } from '../config/layout'
import HangingShelf from '../objects/HangingShelf'
import CeilingFan from '../objects/CeilingFan'
import AreaRug from '../objects/AreaRug'
import PottedPlant from '../objects/PottedPlant'
import GalleryWall from '../objects/GalleryWall'

/**
 * Renders the non-interactable ambiance props from the AMBIANCE config via a
 * type→component registry. Add a prop = create its component, register it here,
 * add an AMBIANCE entry in config/layout.ts. (Clock, fan, etc. land here later.)
 */
type ObjProps = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }

const REGISTRY: Record<string, (p: ObjProps) => JSX.Element> = {
  HangingShelf,
  CeilingFan,
  AreaRug,
  PottedPlant,
  GalleryWall,
}

export default function Ambiance() {
  return (
    <group>
      {AMBIANCE.map((a) => {
        const Comp = REGISTRY[a.type]
        return Comp ? <Comp key={a.id} position={a.position} rotation={a.rotation} scale={a.scale} /> : null
      })}
    </group>
  )
}
