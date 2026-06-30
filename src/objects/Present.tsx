import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * The "Gifted" project present: a navy gift box with crossed cardinal-red SATIN ribbon and a
 * realistic bow (flattened ribbon loops + knot + draped tails), modeled in Blender with a satin
 * material and baked to a GLB (blender/build_present.py). Origin sits on the floor. Static (no
 * idle wiggle — keeps the scene shadow-bakeable). Clickable → Gifted project.
 */
useGLTF.preload('/models/present.glb')

export default function Present({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const { scene } = useGLTF('/models/present.glb')
  const model = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    return c
  }, [scene])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  )
}
