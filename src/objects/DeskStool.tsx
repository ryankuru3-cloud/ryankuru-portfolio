import type { Vec3 } from '../config/layout'

/**
 * Low, backless desk stool — replaces the tall task chair so nothing crosses the camera's
 * line to the desktop when you zoom into the About Me area (its seat sits well below the desk
 * surface). Backless + low means NO roll-aside animation is needed: it's fully static, so it
 * costs nothing per frame. Charcoal cushioned seat on a slim matte-black 4-leg frame.
 */
const SEAT = '#3a3d44' // charcoal cushion (matches the old chair fabric)
const FRAME = '#202227' // matte-black metal

export default function DeskStool({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const seatY = 0.9
  const legTop = seatY - 0.06
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* round cushioned seat */}
      <mesh position={[0, seatY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 24]} />
        <meshStandardMaterial color={SEAT} roughness={0.8} metalness={0} envMapIntensity={0.35} />
      </mesh>
      {/* slim metal apron under the seat */}
      <mesh position={[0, seatY - 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.165, 0.165, 0.025, 20]} />
        <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.6} />
      </mesh>
      {/* 4 slightly-splayed legs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.16, legTop / 2, 0]} rotation={[0, 0, 0.09]} castShadow>
              <cylinderGeometry args={[0.013, 0.018, legTop + 0.02, 8]} />
              <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.6} />
            </mesh>
          </group>
        )
      })}
      {/* footrest ring */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.01, 6, 20]} />
        <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.6} />
      </mesh>
    </group>
  )
}
