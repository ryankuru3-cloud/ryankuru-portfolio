import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Ceiling fan: mounts to the ceiling (position = the mount point), hangs on a downrod,
 * walnut blades on a matte-black motor spinning slowly, and a light kit under the motor
 * that flickers like a faulty garage/shop light (occasional cuts) — driving both the
 * emissive dome and a point light so the room flickers too.
 */
const BLADES = 5

export default function CeilingFan({ position, rotation }: { position?: Vec3; rotation?: Vec3 }) {
  const blades = useRef<THREE.Group>(null)
  const dome = useRef<THREE.MeshStandardMaterial>(null)
  const light = useRef<THREE.PointLight>(null)

  useFrame((s, dt) => {
    if (blades.current) blades.current.rotation.y += Math.min(dt, 0.05) * 1.1
    const t = s.clock.elapsedTime
    let f = 0.9 + 0.1 * Math.sin(t * 26)
    const n = Math.sin(t * 47) * Math.sin(t * 17.3)
    if (n > 0.9) f *= 0.22 // brief garage-style cut
    if (dome.current) dome.current.emissiveIntensity = 0.4 + f * 1.7
    if (light.current) light.current.intensity = 0.2 + f * 1.0
  })

  const rod = 0.28 // shorter downrod → hangs closer to the ceiling
  const motorY = -rod

  return (
    <group position={position} rotation={rotation}>
      {/* ceiling mount plate */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#26282b" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* downrod */}
      <mesh position={[0, -rod / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, rod, 12]} />
        <meshStandardMaterial color="#26282b" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* motor housing */}
      <mesh position={[0, motorY, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.1, 20]} />
        <meshStandardMaterial color="#2a2c2f" roughness={0.45} metalness={0.55} />
      </mesh>

      {/* spinning blades (walnut) */}
      <group ref={blades} position={[0, motorY - 0.02, 0]}>
        {Array.from({ length: BLADES }).map((_, i) => (
          <group key={i} rotation={[0, (i / BLADES) * Math.PI * 2, 0]}>
            <mesh position={[0.54, 0, 0]} rotation={[0.05, 0, 0]} castShadow>
              <boxGeometry args={[0.8, 0.014, 0.16]} />
              <meshStandardMaterial color="#4a3422" roughness={0.55} metalness={0} envMapIntensity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* flickering light kit */}
      <mesh position={[0, motorY - 0.085, 0]}>
        <sphereGeometry args={[0.065, 18, 14]} />
        <meshStandardMaterial ref={dome} color="#fff4dc" emissive="#ffdf9e" emissiveIntensity={1.6} roughness={0.3} />
      </mesh>
      <pointLight ref={light} position={[0, motorY - 0.13, 0]} color="#ffe6b0" intensity={1.0} distance={6} decay={2} />
    </group>
  )
}
