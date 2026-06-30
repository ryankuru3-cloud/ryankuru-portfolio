import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Fiddle-leaf fig in a woven basket — a leafy floor plant to warm a corner. Static.
 * Tapered tan basket with weave bands + rim, a slim trunk, broad fiddle-shaped leaves (a
 * generated Shape) on short stems spiralling densely up the trunk, and a scatter of bark
 * mulch chips across the soil. Origin sits on the floor.
 */
const BASKET = '#bfa377'
const BASKET_DARK = '#a2855c'
const SOIL = '#241b12'
const TRUNK = '#6f5e49'
const LEAF_A = '#3f7d44'
const LEAF_B = '#347139'
const LEAF_C = '#458a4b'
const VEIN = '#2c5e31'
const MULCH = ['#5a4632', '#6e5640', '#4a3826', '#7a6248', '#3f2f20']

const LEAVES = 21

// deterministic pseudo-random in [0,1) so placement is stable across renders
const rand = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

// fiddle-leaf blade: base at origin, tip at +Y≈1, broadest above the middle with a slight waist
function makeLeafGeo() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.1, 0.06, 0.15, 0.26, 0.13, 0.46)
  s.bezierCurveTo(0.12, 0.62, 0.22, 0.74, 0.18, 0.88)
  s.bezierCurveTo(0.15, 0.96, 0.06, 1.0, 0, 1.0)
  s.bezierCurveTo(-0.06, 1.0, -0.15, 0.96, -0.18, 0.88)
  s.bezierCurveTo(-0.22, 0.74, -0.12, 0.62, -0.13, 0.46)
  s.bezierCurveTo(-0.15, 0.26, -0.1, 0.06, 0, 0)
  return new THREE.ShapeGeometry(s, 14)
}

export default function PottedPlant({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const leafGeo = useMemo(() => makeLeafGeo(), [])

  const leaves = useMemo(
    () =>
      Array.from({ length: LEAVES }, (_, i) => {
        const t = i / (LEAVES - 1)
        const greens = [LEAF_A, LEAF_B, LEAF_C]
        return {
          yaw: i * 2.399 + rand(i) * 0.3, // golden-angle spiral + jitter
          h: 0.4 + t * 1.0, // start lower (less bare trunk) up to the crown
          lean: 1.15 - t * 0.7 + (rand(i + 9) - 0.5) * 0.18, // splay low, reach up top
          size: 0.34 + t * 0.16 + rand(i + 2) * 0.05, // larger toward the top
          green: greens[i % 3],
        }
      }),
    [],
  )

  const mulch = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const a = rand(i + 1) * Math.PI * 2
        const rr = 0.045 + rand(i + 7) * 0.15
        return {
          x: Math.cos(a) * rr,
          z: Math.sin(a) * rr,
          rot: rand(i + 3) * Math.PI,
          tone: MULCH[i % MULCH.length],
          len: 0.02 + rand(i + 5) * 0.024,
        }
      }),
    [],
  )

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ---- woven basket ---- */}
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.23, 0.19, 0.34, 24]} />
        <meshStandardMaterial color={BASKET} roughness={0.9} metalness={0} envMapIntensity={0.3} />
      </mesh>
      {[0.06, 0.16, 0.26].map((y, i) => {
        const r = 0.19 + (y / 0.34) * 0.04 + 0.006
        return (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[r, r, 0.022, 24]} />
            <meshStandardMaterial color={BASKET_DARK} roughness={0.92} metalness={0} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.335, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.228, 0.016, 8, 28]} />
        <meshStandardMaterial color={BASKET_DARK} roughness={0.85} metalness={0} />
      </mesh>
      {/* soil */}
      <mesh position={[0, 0.328, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.205, 24]} />
        <meshStandardMaterial color={SOIL} roughness={1} metalness={0} />
      </mesh>
      {/* bark mulch chips */}
      {mulch.map((m, i) => (
        <mesh key={i} position={[m.x, 0.338, m.z]} rotation={[0, m.rot, 0]} castShadow receiveShadow>
          <boxGeometry args={[m.len, 0.01, m.len * 0.6]} />
          <meshStandardMaterial color={m.tone} roughness={0.96} metalness={0} />
        </mesh>
      ))}

      {/* ---- trunk ---- */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.032, 1.08, 8]} />
        <meshStandardMaterial color={TRUNK} roughness={0.85} metalness={0} />
      </mesh>

      {/* ---- leaves on short stems, spiralling up ---- */}
      {leaves.map((l, i) => (
        <group key={i} rotation={[0, l.yaw, 0]}>
          <group position={[0.028, l.h, 0]} rotation={[0, 0, -l.lean]}>
            {/* petiole */}
            <mesh position={[0, 0.065, 0]} castShadow>
              <cylinderGeometry args={[0.009, 0.012, 0.13, 6]} />
              <meshStandardMaterial color={TRUNK} roughness={0.8} metalness={0} />
            </mesh>
            {/* blade */}
            <mesh geometry={leafGeo} position={[0, 0.13, 0]} scale={l.size} castShadow>
              <meshStandardMaterial color={l.green} roughness={0.5} metalness={0.05} side={THREE.DoubleSide} envMapIntensity={0.4} />
            </mesh>
            {/* midrib */}
            <mesh position={[0, 0.13 + l.size * 0.5, 0.002]} scale={[1, l.size, 1]}>
              <boxGeometry args={[0.006, 1, 0.004]} />
              <meshStandardMaterial color={VEIN} roughness={0.6} metalness={0} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
