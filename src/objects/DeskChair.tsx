import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { useZoomStore } from '../store/useZoomStore'
import type { Vec3 } from '../config/layout'

/**
 * Modern ergonomic task chair: charcoal mesh back + cushioned seat, matte-black frame,
 * tilt mechanism, gas cylinder, and a 5-star caster base. Built facing +Z (a "forward"
 * chair); the FIXTURES rotation turns it ~180° to face the desk and tuck under.
 *
 * The seat/back/arm assembly (the "top") is scaled up TOP× relative to the base so the
 * body reads in proportion to the wide caster base.
 *
 * Animated: when you zoom into the desk zone (a real click-zoom OR the cinematic entry tour's
 * desk beat), the chair slowly rolls aside (world +X, slightly out) and swivels a quarter-turn,
 * then rolls back when focus leaves. The ease is deliberately SLOW/smooth (not snappy) — it's
 * fine if it's still gliding while the camera has moved on to another area.
 */
const CLEAR_ZONE = 'desk'
const ROLL = new THREE.Vector3(1.7, 0, 0.2) // world offset when cleared aside (right past the desk edge + slightly out)
const SWIVEL = Math.PI / 2 // quarter turn the OTHER way — ends facing the whiteboard (someone seated faces −X)

const TOP = 1.6 // the seat/back/arm assembly is 60% larger than the base
const BASE = 1.4 // the 5-star caster base is 40% larger so it reads beefy under the big top
const SEAT_W = 0.52
const SEAT_D = 0.5
const SEAT_T = 0.1
const BACK_H = 0.62
const MOUNT_Y = 0.84 // top of the gas cylinder; the scaled seat top lands ~1.0

const BLACK = '#202227' // matte-black frame / base / post
const FABRIC = '#34373d' // charcoal seat cushion
const MESH = '#3c4046' // charcoal back mesh
const CASTER = '#15161a'

export default function DeskChair({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const root = useRef<THREE.Group>(null)
  const prog = useRef(0)
  const zone = useZoomStore((s) => s.zone)
  const previewZone = useZoomStore((s) => s.previewZone)

  const base = position ?? [0, 0, 0]
  const baseRotY = rotation ? rotation[1] : 0

  useFrame((_, dt) => {
    const g = root.current
    if (!g) return
    // ease toward "aside" (1) when zoomed into the desk — via a real click-zoom OR the cinematic
    // entry tour's desk beat — else back to "tucked" (0). Deliberately SLOW (small per-frame
    // factor) so the chair glides rather than snaps; ok if it's still moving as the camera leaves.
    const target = zone === CLEAR_ZONE || previewZone === CLEAR_ZONE ? 1 : 0
    // settled → snap once and skip all per-frame matrix writes until it needs to move again
    if (Math.abs(target - prog.current) < 0.0006) {
      if (prog.current !== target) {
        prog.current = target
        g.position.set(base[0] + ROLL.x * target, base[1] + ROLL.y * target, base[2] + ROLL.z * target)
        g.rotation.y = baseRotY + SWIVEL * target
      }
      return
    }
    const a = 1 - Math.pow(0.3, Math.min(dt, 0.05))
    prog.current += (target - prog.current) * a
    const e = prog.current
    g.position.set(base[0] + ROLL.x * e, base[1] + ROLL.y * e, base[2] + ROLL.z * e)
    g.rotation.y = baseRotY + SWIVEL * e
  })

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      {/* ---- 5-star caster base (enlarged 40% so it reads beefy under the big top) ---- */}
      <group scale={BASE}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.07, 16]} />
          <meshStandardMaterial color={BLACK} roughness={0.5} metalness={0.45} envMapIntensity={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
            {/* leg spoke */}
            <mesh position={[0.17, 0.055, 0]} rotation={[0, 0, 0.06]} castShadow>
              <boxGeometry args={[0.32, 0.045, 0.06]} />
              <meshStandardMaterial color={BLACK} roughness={0.5} metalness={0.45} envMapIntensity={0.5} />
            </mesh>
            {/* caster wheel */}
            <mesh position={[0.32, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.036, 0.036, 0.032, 14]} />
              <meshStandardMaterial color={CASTER} roughness={0.45} metalness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- gas cylinder ---- */}
      <mesh position={[0, (0.155 + MOUNT_Y) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, MOUNT_Y - 0.155, 16]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* ---- TOP assembly (60% larger), mounted on the post ---- */}
      <group position={[0, MOUNT_Y, 0]} scale={TOP}>
        {/* tilt mechanism */}
        <mesh position={[0, -0.01, 0]} castShadow>
          <boxGeometry args={[0.16, 0.06, 0.22]} />
          <meshStandardMaterial color={BLACK} roughness={0.5} metalness={0.45} />
        </mesh>

        {/* seat cushion (top at local y = SEAT_T) */}
        <RoundedBox args={[SEAT_W, SEAT_T, SEAT_D]} radius={0.03} smoothness={4} position={[0, SEAT_T / 2, 0.02]} castShadow receiveShadow>
          <meshStandardMaterial color={FABRIC} roughness={0.9} metalness={0} envMapIntensity={0.3} />
        </RoundedBox>

        {/* backrest (behind the sitter, reclined) */}
        <group position={[0, SEAT_T, -SEAT_D / 2 + 0.04]} rotation={[-0.16, 0, 0]}>
          <RoundedBox args={[0.5, BACK_H, 0.05]} radius={0.025} smoothness={4} position={[0, BACK_H / 2, 0]} castShadow>
            <meshStandardMaterial color={BLACK} roughness={0.5} metalness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.4, BACK_H - 0.1, 0.03]} radius={0.02} smoothness={4} position={[0, BACK_H / 2, 0.025]} castShadow>
            <meshStandardMaterial color={MESH} roughness={0.95} metalness={0} envMapIntensity={0.25} />
          </RoundedBox>
          <mesh position={[0, BACK_H * 0.32, 0.04]}>
            <boxGeometry args={[0.42, 0.03, 0.02]} />
            <meshStandardMaterial color="#2a2c31" roughness={0.7} metalness={0.2} />
          </mesh>
        </group>

        {/* armrests */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * (SEAT_W / 2 + 0.005), SEAT_T + 0.09, -0.02]} castShadow>
              <boxGeometry args={[0.03, 0.2, 0.04]} />
              <meshStandardMaterial color={BLACK} roughness={0.5} metalness={0.4} />
            </mesh>
            <RoundedBox args={[0.05, 0.04, 0.24]} radius={0.018} smoothness={3} position={[s * (SEAT_W / 2 + 0.005), SEAT_T + 0.19, 0]} castShadow>
              <meshStandardMaterial color="#26282d" roughness={0.85} metalness={0} />
            </RoundedBox>
          </group>
        ))}
      </group>
    </group>
  )
}
