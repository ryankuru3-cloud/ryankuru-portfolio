import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { getOakDeskTexture } from '../lib/woodTexture'
import { DESK_TOP, type Vec3 } from '../config/layout'

/**
 * Large modern-minimalist desk: light-oak top with solid waterfall side panels,
 * a recessed modesty back panel, and one slim drawer with a brushed pull.
 * Surface only (the framed photo / computer screen / nameplate sit on top later).
 *
 * Height: the top sits 20% of the window height above the bottom sill, so it covers
 * the lower ~20% of the window — fills the under-window space (no longer kid-sized).
 */
const W = 3.4 // width (X)
const D = 1.05 // depth (Z)
const H = DESK_TOP // top height ≈ 1.41 (sill + 20% of window height)
const TOP = 0.06
const PANEL = 0.07
const LEG = H - TOP

export default function Desk({ position, rotation }: { position?: Vec3; rotation?: Vec3 }) {
  const oak = useMemo(() => getOakDeskTexture(), [])

  return (
    <group position={position} rotation={rotation}>
      {/* top */}
      <RoundedBox args={[W, TOP, D]} radius={0.014} smoothness={4} position={[0, H - TOP / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={oak} roughness={0.45} metalness={0} envMapIntensity={0.5} />
      </RoundedBox>

      {/* waterfall side panels */}
      {[-(W / 2 - PANEL / 2), W / 2 - PANEL / 2].map((x, i) => (
        <mesh key={i} position={[x, LEG / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[PANEL, LEG, D]} />
          <meshStandardMaterial map={oak} roughness={0.5} metalness={0} envMapIntensity={0.4} />
        </mesh>
      ))}

      {/* recessed modesty back panel */}
      <mesh position={[0, LEG * 0.62, -(D / 2 - 0.06)]} castShadow receiveShadow>
        <boxGeometry args={[W - PANEL * 2 - 0.04, LEG * 0.5, 0.03]} />
        <meshStandardMaterial map={oak} roughness={0.55} metalness={0} envMapIntensity={0.3} />
      </mesh>

      {/* slim drawer just under the top (right side), front flush with the desk edge */}
      <mesh position={[W / 2 - 0.62, H - TOP - 0.075, D / 2 - 0.24]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.12, 0.46]} />
        <meshStandardMaterial map={oak} roughness={0.45} metalness={0} envMapIntensity={0.4} />
      </mesh>
      {/* brushed drawer pull */}
      <mesh position={[W / 2 - 0.62, H - TOP - 0.075, D / 2 + 0.005]}>
        <boxGeometry args={[0.2, 0.018, 0.024]} />
        <meshStandardMaterial color="#9b9ea1" roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  )
}
