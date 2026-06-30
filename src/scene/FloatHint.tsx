import { useRef, useEffect, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Affordance hint: while `active`, the wrapped item breathes a soft warm GLOW so it reads as
 * "click me"; it eases back to rest when inactive. (No float/bob — glow only, per Ryan.)
 *
 * The glow is set DIRECTLY (emissiveIntensity driven from near-off to bright), NOT added on
 * top of the material's existing level — that's what makes the pulse actually read instead of
 * sitting steady. Only non-emissive surfaces glow (intentional emissive accents like the CRT
 * screen are left alone); originals are restored on cleanup. `phase` desyncs siblings so a row
 * of items doesn't pulse in lockstep.
 */
const WARM = new THREE.Color('#e0a86a')

type Tracked = { mat: THREE.MeshStandardMaterial; emissive: THREE.Color; intensity: number }

export default function FloatHint({
  active,
  phase = 0,
  children,
}: {
  active: boolean
  phase?: number
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  const tracked = useRef<Tracked[]>([])
  const level = useRef(0) // eased 0 → 1

  useEffect(() => {
    const grp = ref.current
    if (!grp) return
    const list: Tracked[] = []
    grp.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.material) return
      const arr = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      arr.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial
        if (std.emissive && std.emissive.getHex() === 0x000000) {
          list.push({ mat: std, emissive: std.emissive.clone(), intensity: std.emissiveIntensity ?? 1 })
        }
      })
    })
    tracked.current = list
    return () =>
      list.forEach((t) => {
        t.mat.emissive.copy(t.emissive)
        t.mat.emissiveIntensity = t.intensity
      })
  }, [])

  useFrame((state) => {
    const grp = ref.current
    if (!grp) return
    const t = state.clock.elapsedTime
    level.current += ((active ? 1 : 0) - level.current) * 0.08
    const v = level.current

    // Glow — breathing pulse set directly (clear swing from near-off to bright). No float/bob.
    if (v < 0.002) {
      tracked.current.forEach((r) => {
        r.mat.emissive.copy(r.emissive)
        r.mat.emissiveIntensity = r.intensity
      })
      return
    }
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + phase)
    const intensity = v * (0.1 + 0.9 * pulse)
    tracked.current.forEach((r) => {
      r.mat.emissive.copy(WARM)
      r.mat.emissiveIntensity = intensity
    })
  })

  return <group ref={ref}>{children}</group>
}
