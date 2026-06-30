import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { getArizonaGradTexture } from '../lib/galleryTextures'
import type { Vec3 } from '../config/layout'

/**
 * Portrait desk photo in a matte-black frame — a University of Arizona graduation
 * portrait (procedural, see lib/galleryTextures). A faint specular glint sweeps across
 * the glass occasionally. Origin is the base-center so it rests on the desk top; `scale`
 * sizes it from the config. Clickable → Bio.
 */
const FW = 0.26 // frame width
const FH = 0.34 // frame height (portrait)
const FD = 0.024 // frame depth
const BORDER = 0.026
const MAT = 0.02

export default function FramedPhoto({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const glint = useRef<THREE.Mesh>(null)
  const avatar = useMemo(() => getArizonaGradTexture(), [])

  useFrame((state) => {
    const m = glint.current
    if (!m) return
    const mat = m.material as THREE.MeshBasicMaterial
    const period = 7
    const sweep = 1.2
    const t = state.clock.elapsedTime % period
    if (t < sweep) {
      const p = t / sweep
      m.position.x = THREE.MathUtils.lerp(-FW * 0.42, FW * 0.42, p)
      mat.opacity = Math.sin(p * Math.PI) * 0.25
    } else {
      mat.opacity = 0
    }
  })

  const photoW = FW - 2 * BORDER - 2 * MAT
  const photoH = FH - 2 * BORDER - 2 * MAT

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* matte black frame */}
      <RoundedBox args={[FW, FH, FD]} radius={0.006} smoothness={3} position={[0, FH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1b1b1d" roughness={0.62} metalness={0.1} />
      </RoundedBox>
      {/* white mat */}
      <mesh position={[0, FH / 2, FD / 2 - 0.002]}>
        <boxGeometry args={[FW - 2 * BORDER, FH - 2 * BORDER, 0.006]} />
        <meshStandardMaterial color="#f4f2ec" roughness={0.7} />
      </mesh>
      {/* generic silhouette placeholder (real headshot swaps in via the bio panel) */}
      <mesh position={[0, FH / 2, FD / 2 + 0.002]}>
        <planeGeometry args={[photoW, photoH]} />
        <meshStandardMaterial map={avatar} roughness={0.85} />
      </mesh>
      {/* glass */}
      <mesh position={[0, FH / 2, FD / 2 + 0.004]}>
        <planeGeometry args={[FW - 2 * BORDER, FH - 2 * BORDER]} />
        <meshStandardMaterial color="#dfe7ee" transparent opacity={0.07} roughness={0.05} metalness={0} />
      </mesh>
      {/* animated specular glint sweep */}
      <group position={[0, FH / 2, FD / 2 + 0.006]}>
        <mesh ref={glint} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.035, FH * 0.95]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      {/* easel kickstand */}
      <mesh position={[0, FH * 0.2, -0.05]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.04, FH * 0.45, 0.01]} />
        <meshStandardMaterial color="#1b1b1d" roughness={0.62} />
      </mesh>
    </group>
  )
}
