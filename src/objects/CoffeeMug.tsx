import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Cream ceramic coffee mug with dark coffee and animated steam — a few soft white wisps
 * rise from the surface, sway, grow and fade on a staggered loop. Origin sits on the
 * desk. Clickable → desk zone.
 */
const CERAMIC = '#e7ddcd'
const COFFEE = '#3a2417'
const WISPS = 2 // fewer transparent steam planes = less per-frame overdraw (steam is subtle anyway)

function makeSteamTex() {
  const s = 64
  const cv = document.createElement('canvas')
  cv.width = s
  cv.height = s
  const ctx = cv.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function CoffeeMug({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const steamTex = useMemo(() => makeSteamTex(), [])
  const wisps = useRef<(THREE.Mesh | null)[]>([])

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const period = 3.2
    for (let i = 0; i < WISPS; i++) {
      const m = wisps.current[i]
      if (!m) continue
      const ph = ((t / period + i / WISPS) % 1 + 1) % 1 // 0..1
      const y = 0.085 + ph * 0.17 // rise above the cup
      const sway = Math.sin(ph * Math.PI * 2.5 + i * 1.7) * 0.014 // curl
      const sc = 0.6 + ph * 1.1 // grow as it rises
      m.position.set(sway, y, 0)
      m.scale.set(sc, sc * 1.25, sc)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(ph * Math.PI) * 0.75
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* mug body */}
      <mesh position={[0, 0.043, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.047, 0.04, 0.086, 28]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.5} metalness={0} envMapIntensity={0.4} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.041, 24]} />
        <meshStandardMaterial color={COFFEE} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.086, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0465, 0.0035, 8, 28]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.5} metalness={0} />
      </mesh>
      {/* handle */}
      <mesh position={[0.064, 0.046, 0]} castShadow>
        <torusGeometry args={[0.022, 0.006, 10, 20]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.5} metalness={0} envMapIntensity={0.4} />
      </mesh>
      {/* steam wisps */}
      {Array.from({ length: WISPS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            wisps.current[i] = el
          }}
        >
          <planeGeometry args={[0.08, 0.11]} />
          <meshBasicMaterial map={steamTex} transparent opacity={0} depthWrite={false} side={THREE.FrontSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
