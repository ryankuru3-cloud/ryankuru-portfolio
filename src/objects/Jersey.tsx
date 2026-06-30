import { useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getWoodFloorTexture } from '../lib/woodTexture'
import type { Vec3 } from '../config/layout'

/**
 * Arizona Wildcats jersey EXHIBIT: full detailed jersey (compressed GLB) on a medium walnut
 * display stand under a warm spotlight. No spin. Runs its OWN hint (selfHint in FIXTURES): the
 * WHOLE piece lifts together AND the JERSEY itself breathes a warm emissive glow (the podium does
 * not), so the jersey is the focal point. The jersey's baked emissive map is cleared so the glow
 * actually reads; intensity is driven per-frame (cheap). Hint retires once visited / opened.
 */
useGLTF.preload('/models/jersey_full.glb')

const WARM = new THREE.Color('#ffcf8f')

type Finish = 'steel' | 'black' | 'walnut' | 'marble' | 'navy'
const STAND_FINISH: Finish = 'walnut'

const SCALE = 0.38
const BASE_H = 0.05
const COL_H = 0.55
const CAP_H = 0.05
const TOP = BASE_H + COL_H + CAP_H
const JERSEY_HALF = 0.95 * SCALE
const JERSEY_Y = TOP + JERSEY_HALF - 0.02

export default function Jersey({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const { scene } = useGLTF('/models/jersey_full.glb')
  // Clone the model + its materials (so we own them), and prep the jersey materials to glow:
  // clear the baked emissive map and set a warm emissive colour at 0 intensity (driven per-frame).
  const model = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = true
      m.receiveShadow = true
      m.material = Array.isArray(m.material) ? m.material.map((s) => s.clone()) : (m.material as THREE.Material).clone()
      const list = Array.isArray(m.material) ? m.material : [m.material]
      list.forEach((mm) => {
        const std = mm as THREE.MeshStandardMaterial
        if (std.isMeshStandardMaterial) {
          std.emissiveMap = null
          std.emissive = WARM.clone()
          std.emissiveIntensity = 0
          std.needsUpdate = true
        }
      })
    })
    return c
  }, [scene])

  const target = useMemo(() => new THREE.Object3D(), [])
  const wood = useMemo(() => (STAND_FINISH === 'walnut' ? getWoodFloorTexture() : null), [])
  const mat: Record<string, unknown> =
    STAND_FINISH === 'steel'
      ? { color: '#8d9197', roughness: 0.34, metalness: 0.85 }
      : STAND_FINISH === 'black'
        ? { color: '#0c0c10', roughness: 0.72, metalness: 0.1 }
        : STAND_FINISH === 'walnut'
          ? { map: wood, roughness: 0.55, metalness: 0 }
          : STAND_FINISH === 'marble'
            ? { color: '#e9e7e1', roughness: 0.42, metalness: 0.08 }
            : { color: '#0C234B', roughness: 0.5, metalness: 0.1 }

  // Glow hint removed — the jersey is lit by its steady spotlight only (no per-frame work).
  const floatRef = useRef<THREE.Group>(null)

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={floatRef}>
        {/* medium walnut display stand: wide base → slim column → top platform */}
        <mesh position={[0, BASE_H / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.28, BASE_H, 48]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        <mesh position={[0, BASE_H + COL_H / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.085, 0.1, COL_H, 40]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        <mesh position={[0, BASE_H + COL_H + CAP_H / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.18, CAP_H, 48]} />
          <meshStandardMaterial {...mat} />
        </mesh>

        {/* the jersey, standing on the platform */}
        <group position={[0, JERSEY_Y, 0]} scale={SCALE}>
          <primitive object={model} />
        </group>

        {/* warm spotlight pooling on the jersey */}
        <primitive object={target} position={[0, JERSEY_Y, 0]} />
        <spotLight position={[0.15, JERSEY_Y + 1.4, 1.0]} target={target} angle={0.5} penumbra={0.7} intensity={13} distance={6} decay={1.5} color="#fff3df" />
      </group>
    </group>
  )
}
