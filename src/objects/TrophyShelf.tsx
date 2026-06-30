import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getWoodFloorTexture } from '../lib/woodTexture'
import type { Vec3 } from '../config/layout'

/**
 * DECA "Arizona" competition trophy — a clean rebuilt acrylic award (clear-acrylic base + a flat
 * Arizona-flag/DECA print on the front face, authored from Ryan's untextured shape in
 * blender/build_trophy.py + gen_trophy_flag.py). Rests STATICALLY on a wall-mounted walnut shelf;
 * the GLB carries its own clean materials (don't munge them). Only the small display light pulses
 * for the affordance hint. Clickable → Competition Trophy.
 */
useGLTF.preload('/models/trophy.glb')

const SHELF_W = 0.66
const SHELF_T = 0.05
const SHELF_D = 0.3
const T_Z = SHELF_D * 0.5 // trophy centered on the shelf depth
const TROPHY_BASE_Y = SHELF_T / 2 // GLB origin sits at the award's base
const FRONT_YAW = 0 // flip by π if the print faces the wall

export default function TrophyShelf({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const { scene } = useGLTF('/models/trophy.glb')
  const model = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.castShadow = true
    })
    return c
  }, [scene])

  const wood = useMemo(() => getWoodFloorTexture(), [])
  const mat = { map: wood, color: '#5c4329', roughness: 0.5, metalness: 0, envMapIntensity: 0.4 } as const
  const target = useMemo(() => new THREE.Object3D(), [])
  const midY = TROPHY_BASE_Y + 0.24
  // Glow hint removed — the display light sits steady (no per-frame work).

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* walnut shelf board (back edge flush to the wall, protruding into the room) */}
      <mesh position={[0, 0, T_Z]} castShadow receiveShadow>
        <boxGeometry args={[SHELF_W, SHELF_T, SHELF_D]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* two support brackets under the board, near the wall */}
      {[-SHELF_W * 0.34, SHELF_W * 0.34].map((x, i) => (
        <mesh key={i} position={[x, -0.085, 0.07]} castShadow>
          <boxGeometry args={[0.04, 0.13, 0.13]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}

      {/* the trophy, static, its base seated on the shelf */}
      <group position={[0, TROPHY_BASE_Y, T_Z]} rotation={[0, FRONT_YAW, 0]}>
        <primitive object={model} />
      </group>

      {/* small warm display light from above-front */}
      <primitive object={target} position={[0, midY, T_Z]} />
      <spotLight
        position={[0, midY + 0.8, T_Z + 0.7]}
        target={target}
        angle={0.6}
        penumbra={0.8}
        intensity={9}
        distance={4}
        decay={1.4}
        color="#fff3df"
      />
    </group>
  )
}
