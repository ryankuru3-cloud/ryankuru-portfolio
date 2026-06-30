import { useMemo } from 'react'
import { getRugTexture } from '../lib/rugTexture'
import type { Vec3 } from '../config/layout'

/**
 * Warm traditional (Persian-style) area rug under the desk + chair — a flat plane lying
 * on the floor with the generated pattern. Static. Origin sits on the floor; sized to
 * ground the workspace zone.
 */
const W = 2.8 // X
const D = 2.2 // Z

export default function AreaRug({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const tex = useMemo(() => getRugTexture(), [])
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* flat rug lying on the floor, just above it to avoid z-fighting */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} envMapIntensity={0.3} />
      </mesh>
    </group>
  )
}
