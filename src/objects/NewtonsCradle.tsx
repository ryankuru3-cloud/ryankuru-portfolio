import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Newton's cradle desk toy: five chrome balls hung on V-strings from a chrome frame.
 * Animated with the classic motion — the end ball swings out and back, "transferring"
 * to the opposite end ball, alternating forever while the middle three stay still.
 * Origin sits on the desk. Clickable → desk zone.
 */
const CHROME = '#d6d9de'
const FRAME = '#cacdd2'
const BASE = '#241f1a'
const STRING = '#4a4a4e'

const N = 5
const R = 0.017 // ball radius
const SPACING = 0.035 // ball-center spacing
const PIVOT_Y = 0.16 // top-bar height
const STRING_LEN = 0.095 // pivot → ball
const Z_OFF = 0.042 // V-string spread / bar offset in Z
const POST_X = 0.14
const SWING = 0.45 // max swing angle (rad)
const PERIOD = 1.15 // full cycle: left swing then right swing

export default function NewtonsCradle({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const leftRef = useRef<THREE.Group>(null)
  const rightRef = useRef<THREE.Group>(null)

  useFrame((s) => {
    const phase = ((s.clock.elapsedTime / PERIOD) % 1 + 1) % 1
    let l = 0
    let r = 0
    if (phase < 0.5) l = -SWING * Math.sin((phase / 0.5) * Math.PI)
    else r = SWING * Math.sin(((phase - 0.5) / 0.5) * Math.PI)
    if (leftRef.current) leftRef.current.rotation.z = l
    if (rightRef.current) rightRef.current.rotation.z = r
  })

  const xs = useMemo(() => Array.from({ length: N }, (_, i) => (i - (N - 1) / 2) * SPACING), [])

  // the two V-strings per ball (shared transform for every ball)
  const strings = useMemo(
    () =>
      [-1, 1].map((sz) => {
        const top = new THREE.Vector3(0, 0, sz * Z_OFF)
        const bot = new THREE.Vector3(0, -STRING_LEN, 0)
        const dir = bot.clone().sub(top)
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        const mid = top.clone().add(bot).multiplyScalar(0.5)
        return { pos: mid.toArray() as [number, number, number], quat: q, len: dir.length() }
      }),
    [],
  )

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* base */}
      <mesh position={[0, 0.011, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.022, 0.11]} />
        <meshStandardMaterial color={BASE} roughness={0.5} metalness={0.25} />
      </mesh>
      {/* corner posts */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * POST_X, (0.022 + PIVOT_Y) / 2, sz * Z_OFF]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, PIVOT_Y - 0.022, 10]} />
            <meshStandardMaterial color={FRAME} roughness={0.2} metalness={0.9} envMapIntensity={1.1} />
          </mesh>
        )),
      )}
      {/* top bars */}
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, PIVOT_Y, sz * Z_OFF]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, POST_X * 2 + 0.01, 10]} />
          <meshStandardMaterial color={FRAME} roughness={0.2} metalness={0.9} envMapIntensity={1.1} />
        </mesh>
      ))}
      {/* balls on V-strings */}
      {xs.map((x, i) => {
        const ref = i === 0 ? leftRef : i === N - 1 ? rightRef : undefined
        return (
          <group key={i} ref={ref} position={[x, PIVOT_Y, 0]}>
            {strings.map((st, j) => (
              <mesh key={j} position={st.pos} quaternion={st.quat}>
                <cylinderGeometry args={[0.0014, 0.0014, st.len, 5]} />
                <meshStandardMaterial color={STRING} roughness={0.7} metalness={0.1} />
              </mesh>
            ))}
            <mesh position={[0, -STRING_LEN, 0]} castShadow>
              <sphereGeometry args={[R, 20, 16]} />
              <meshStandardMaterial color={CHROME} roughness={0.12} metalness={0.95} envMapIntensity={1.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
