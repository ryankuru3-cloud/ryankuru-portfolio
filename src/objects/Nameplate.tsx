import { useMemo } from 'react'
import { getPlateTexture } from '../lib/plateTexture'
import type { Vec3 } from '../config/layout'

/**
 * Desk nameplate: brass plate (engraved name + email) tilted back, resting on top of a
 * low walnut base so the full face — including the email — stays above the base.
 * Origin sits on the desk; faces +Z. Clickable → Contact.
 */
const PW = 0.36
const PH = 0.105
const BASE_H = 0.02
const TILT = 0.28

export default function Nameplate({ position, rotation }: { position?: Vec3; rotation?: Vec3 }) {
  const tex = useMemo(() => getPlateTexture('Ryan Kuru', 'ryankuru@arizona.edu'), [])
  // bottom edge of the (tilted) plate rests on the base top, so nothing sinks in
  const plateCY = BASE_H + (PH / 2) * Math.cos(TILT)

  return (
    <group position={position} rotation={rotation}>
      {/* low walnut base */}
      <mesh position={[0, BASE_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PW + 0.05, BASE_H, 0.075]} />
        <meshStandardMaterial color="#5a3d27" roughness={0.55} metalness={0} envMapIntensity={0.3} />
      </mesh>
      {/* brass plate, tilted back, full face above the base */}
      <group position={[0, plateCY, 0.012]} rotation={[-TILT, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[PW, PH, 0.01]} />
          <meshStandardMaterial color="#a9853f" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[PW, PH]} />
          <meshStandardMaterial map={tex} roughness={0.4} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
