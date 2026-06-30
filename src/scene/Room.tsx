import { useMemo } from 'react'
import { ROOM } from '../config/layout'
import { palette } from '../config/theme'
import { getWoodFloorTexture } from '../lib/woodTexture'

/**
 * The cutaway room shell: dark-walnut floor, a solid back wall + solid left wall,
 * and baseboards. Front (+Z) and right (+X) are left open (dollhouse); no ceiling.
 * (Window removed — plain back wall.)
 */
export default function Room() {
  const W = ROOM.width
  const D = ROOM.depth
  const H = ROOM.height
  const t = ROOM.wall
  const hw = W / 2
  const hd = D / 2
  const wallZ = -hd + t / 2

  const wood = useMemo(() => getWoodFloorTexture(), [])

  return (
    <group>
      {/* Floor — thick walnut slab (top surface at y=0), plank texture on top, clean dark edges */}
      <mesh receiveShadow position={[0, -t / 2, 0]}>
        <boxGeometry args={[W, t, D]} />
        <meshStandardMaterial attach="material-0" color="#3a2818" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#3a2818" roughness={0.6} />
        <meshStandardMaterial attach="material-2" map={wood} roughness={0.48} metalness={0} envMapIntensity={0.55} />
        <meshStandardMaterial attach="material-3" color="#241a10" roughness={0.7} />
        <meshStandardMaterial attach="material-4" color="#3a2818" roughness={0.6} />
        <meshStandardMaterial attach="material-5" color="#3a2818" roughness={0.6} />
      </mesh>

      {/* Back wall — solid */}
      <mesh castShadow receiveShadow position={[0, H / 2, wallZ]}>
        <boxGeometry args={[W, H, t]} />
        <meshStandardMaterial color={palette.wallBack} roughness={0.95} />
      </mesh>

      {/* Left wall — solid */}
      <mesh castShadow receiveShadow position={[-hw + t / 2, H / 2, 0]}>
        <boxGeometry args={[t, H, D]} />
        <meshStandardMaterial color={palette.wall} roughness={0.95} />
      </mesh>

      {/* Baseboards */}
      <mesh position={[0, 0.06, -hd + t + 0.013]}>
        <boxGeometry args={[W, 0.12, 0.026]} />
        <meshStandardMaterial color={palette.baseboard} roughness={0.7} />
      </mesh>
      <mesh position={[-hw + t + 0.013, 0.06, 0]}>
        <boxGeometry args={[0.026, 0.12, D]} />
        <meshStandardMaterial color={palette.baseboard} roughness={0.7} />
      </mesh>

      {/* Ceiling removed — open-top dollhouse. */}
    </group>
  )
}
