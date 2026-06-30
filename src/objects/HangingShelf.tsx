import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getSpineTexture } from '../lib/spineTexture'
import type { Vec3 } from '../config/layout'

/**
 * Floating walnut shelf (cantilevered — no visible brackets) centered above the desk.
 * Non-fiction books stand in a tight row between classic metal bookends; ONE book at a
 * time gently floats out off the shelf and back, cycling through the row on a loop.
 * Spines carry real titles.
 */
const SHELF_W = 1.0
const SHELF_D = 0.2
const SHELF_T = 0.05

const SLOT = 4.0 // seconds each book "owns" before the next (slower cadence)
const ACTIVE = 3.0 // of that slot, how long it's floating out (rest = seated)

type BookDef = { title: string; bg: string; fg: string; thick: number; height: number }
const BOOKS: BookDef[] = [
  { title: '$100M Offers', bg: '#b5302a', fg: '#f3e9c9', thick: 0.07, height: 0.27 },
  { title: '$100M Leads', bg: '#e2b007', fg: '#2a2207', thick: 0.07, height: 0.275 },
  { title: '$100M Money Models', bg: '#2f6fae', fg: '#eaf2fb', thick: 0.075, height: 0.265 },
  { title: 'The Psychology of Money', bg: '#26323f', fg: '#dfe6ee', thick: 0.055, height: 0.25 },
  { title: 'Atomic Habits', bg: '#e6dcae', fg: '#3a3320', thick: 0.06, height: 0.255 },
  { title: 'Zero to One', bg: '#1c1c1c', fg: '#f2f2f2', thick: 0.05, height: 0.245 },
  { title: 'Rich Dad Poor Dad', bg: '#6a4c93', fg: '#f0e9f6', thick: 0.065, height: 0.26 },
]

function Book({ def, x, baseY, index, count }: { def: BookDef; x: number; baseY: number; index: number; count: number }) {
  const ref = useRef<THREE.Group>(null)
  const prevOut = useRef(-1)
  const tex = useMemo(() => getSpineTexture(def.title, def.bg, def.fg), [def])
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    const period = count * SLOT
    const localT = (((t - index * SLOT) % period) + period) % period
    const out = localT < ACTIVE ? Math.sin((localT / ACTIVE) * Math.PI) : 0 // only this book's slot lifts it
    if (out === 0 && prevOut.current === 0) return // seated and already at rest → skip writes
    prevOut.current = out
    ref.current.position.z = out * 0.17
    ref.current.position.y = baseY + out * 0.025
    ref.current.rotation.x = -out * 0.12
  })
  const depth = SHELF_D * 0.8
  return (
    <group ref={ref} position={[x, baseY, 0]}>
      <mesh>
        <boxGeometry args={[def.thick, def.height, depth]} />
        <meshStandardMaterial attach="material-0" color={def.bg} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={def.bg} roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#efe7d0" roughness={0.85} />
        <meshStandardMaterial attach="material-3" color={def.bg} roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={def.bg} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Bookend({ innerX, dir, shelfTop }: { innerX: number; dir: number; shelfTop: number }) {
  const H = 0.19
  const D = 0.15
  const PLATE = 0.012
  const BASE = 0.11
  return (
    <group>
      {/* vertical plate against the end book */}
      <mesh position={[innerX + (dir * PLATE) / 2, shelfTop + H / 2, 0]} castShadow>
        <boxGeometry args={[PLATE, H, D]} />
        <meshStandardMaterial color="#2f3236" roughness={0.5} metalness={0.55} envMapIntensity={0.5} />
      </mesh>
      {/* base resting on the shelf, extending into the empty space */}
      <mesh position={[innerX + dir * (PLATE + BASE / 2), shelfTop + 0.008, 0]} castShadow>
        <boxGeometry args={[BASE, 0.014, D]} />
        <meshStandardMaterial color="#2f3236" roughness={0.5} metalness={0.55} envMapIntensity={0.5} />
      </mesh>
    </group>
  )
}

export default function HangingShelf({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const placed = useMemo(() => {
    const gap = 0.006 // tight row so the bookends bracket it
    const total = BOOKS.reduce((a, b) => a + b.thick, 0) + gap * (BOOKS.length - 1)
    let cx = -total / 2
    return BOOKS.map((def) => {
      const x = cx + def.thick / 2
      cx += def.thick + gap
      return { def, x, baseY: SHELF_T / 2 + def.height / 2 }
    })
  }, [])

  const shelfTop = SHELF_T / 2
  const first = placed[0]
  const last = placed[placed.length - 1]
  const leftEdge = first.x - first.def.thick / 2
  const rightEdge = last.x + last.def.thick / 2

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* floating walnut shelf board */}
      <RoundedBox args={[SHELF_W, SHELF_T, SHELF_D]} radius={0.01} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#4a3422" roughness={0.55} metalness={0} envMapIntensity={0.4} />
      </RoundedBox>
      <Bookend innerX={leftEdge} dir={-1} shelfTop={shelfTop} />
      <Bookend innerX={rightEdge} dir={1} shelfTop={shelfTop} />
      {placed.map((p, i) => (
        <Book key={p.def.title} def={p.def} x={p.x} baseY={p.baseY} index={i} count={placed.length} />
      ))}
    </group>
  )
}
