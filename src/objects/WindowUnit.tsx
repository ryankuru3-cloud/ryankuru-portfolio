import { ROOM, WINDOW } from '../config/layout'
import { palette } from '../config/theme'

/**
 * The window that sits in the back-wall opening: a frame, a mullion cross, a faintly
 * tinted glass pane, and an emissive "sky" plane behind it so the opening reads as a
 * daylight source. Generic — no view detail.
 */
export default function WindowUnit() {
  const w = WINDOW.width
  const h = WINDOW.height
  const cy = WINDOW.sill + h / 2
  const z = -ROOM.depth / 2 + ROOM.wall / 2
  const fr = 0.07
  const t = ROOM.wall

  return (
    <group position={[WINDOW.centerX, cy, z]}>
      {/* frame: top / bottom (sill) / left / right */}
      <mesh position={[0, h / 2 + fr / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + fr * 2, fr, t + 0.04]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>
      <mesh position={[0, -h / 2 - fr / 2, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[w + fr * 2, fr, t + 0.1]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>
      <mesh position={[-w / 2 - fr / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[fr, h, t + 0.04]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 + fr / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[fr, h, t + 0.04]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>

      {/* mullion cross */}
      <mesh>
        <boxGeometry args={[0.04, h, 0.04]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>
      <mesh>
        <boxGeometry args={[w, 0.04, 0.04]} />
        <meshStandardMaterial color={palette.windowFrame} roughness={0.6} />
      </mesh>

      {/* glass */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={palette.glass} roughness={0.1} metalness={0} transparent opacity={0.35} />
      </mesh>

      {/* sky glow behind the opening (reads as daylight) */}
      <mesh position={[0, 0, -0.18]}>
        <planeGeometry args={[w * 1.7, h * 1.7]} />
        <meshBasicMaterial color={palette.sky} />
      </mesh>
    </group>
  )
}
