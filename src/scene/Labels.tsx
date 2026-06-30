import { LABELS } from '../config/layout'
import { useZoomStore } from '../store/useZoomStore'
import WallLabel from '../objects/WallLabel'

/**
 * Extruded 3D text labels. The big wall labels are always shown; the small desk
 * sub-headers (Biography / Who I Am / Contact Me) appear ONLY while zoomed into the
 * desk zone, and the "About Me" zone title hides once you zoom in. Driven by the
 * `onlyInZone` / `hideInZone` flags in LABELS + the current zoom zone.
 */
export default function Labels() {
  const zone = useZoomStore((s) => s.zone)

  return (
    <group>
      {LABELS.map((l) => {
        if (l.onlyInZone && zone !== l.onlyInZone) return null
        if (l.hideInZone && zone === l.hideInZone) return null
        return (
          <WallLabel
            key={l.id}
            text={l.text}
            position={l.position}
            rotation={l.rotation}
            size={l.size}
            depth={l.depth}
            light={l.light}
          />
        )
      })}
    </group>
  )
}
