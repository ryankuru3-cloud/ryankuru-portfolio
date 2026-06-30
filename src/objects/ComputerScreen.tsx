import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Open MacBook on the desk: space-gray aluminum base + a hinged lid leaning back.
 * The screen plays a stylized "talking-head video" placeholder on a live canvas — an
 * on-camera silhouette with a soft key light, animated audio-level bars (reads as
 * talking), a lower-third (name + "My Professional Journey") and a running progress
 * bar. This is the persona-video target; swap the canvas for the real <video> later.
 * Origin sits on the desk; faces +Z. Clickable → Persona video.
 */
const BODY = '#43464b' // space-gray aluminum
const W = 0.34
const DECK_D = 0.24
const DECK_T = 0.016
const SCREEN_H = 0.225
const SCREEN_T = 0.011

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`

/** Paint one frame of the placeholder talking-head video onto the screen canvas. */
function drawVideo(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // backdrop — cool studio gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#27313d')
  bg.addColorStop(0.55, '#1a222c')
  bg.addColorStop(1, '#10151c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // warm key glow behind the subject (slow drift)
  const gx = w * 0.5 + Math.sin(t * 0.5) * w * 0.02
  const glow = ctx.createRadialGradient(gx, h * 0.4, 6, gx, h * 0.4, h * 0.75)
  glow.addColorStop(0, 'rgba(255,206,150,0.20)')
  glow.addColorStop(1, 'rgba(255,206,150,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // subject — head + shoulders, subtle "talking" bob + sway
  const bob = Math.sin(t * 2.1) * 2.0 + Math.sin(t * 0.8) * 1.5
  const sway = Math.sin(t * 0.6) * 3
  const cx = w * 0.5 + sway
  const headR = h * 0.15
  const headY = h * 0.42 + bob
  ctx.fillStyle = '#46586c'
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.28, h)
  ctx.quadraticCurveTo(cx - w * 0.2, headY + headR * 1.15, cx, headY + headR * 1.0)
  ctx.quadraticCurveTo(cx + w * 0.2, headY + headR * 1.15, cx + w * 0.28, h)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(cx - headR * 0.42, headY, headR * 0.84, headR * 1.3) // neck
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()
  // warm rim light on the head
  const rim = ctx.createLinearGradient(cx - headR, 0, cx + headR, 0)
  rim.addColorStop(0, 'rgba(255,228,195,0)')
  rim.addColorStop(1, 'rgba(255,228,195,0.22)')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()

  // animated audio-level bars (top-right) — reads as talking
  const bars = 13
  const bw = w * 0.013
  const gap = w * 0.0095
  const x0 = w - bars * (bw + gap) - w * 0.05
  const yb = h * 0.15
  for (let i = 0; i < bars; i++) {
    const lvl = (0.5 + 0.5 * Math.sin(t * 7 + i * 0.9)) * (0.45 + 0.55 * Math.sin(t * 3.1 + i * 0.4))
    const bh = h * 0.02 + Math.abs(lvl) * h * 0.1
    ctx.fillStyle = `rgba(124,201,232,${0.45 + Math.abs(lvl) * 0.5})`
    ctx.fillRect(x0 + i * (bw + gap), yb - bh / 2, bw, bh)
  }

  // top-left "live" play dot + a tiny REC-style pulse
  ctx.fillStyle = `rgba(255,90,70,${0.55 + 0.45 * Math.sin(t * 3)})`
  ctx.beginPath()
  ctx.arc(w * 0.075, h * 0.13, w * 0.012, 0, Math.PI * 2)
  ctx.fill()

  // lower-third banner
  const lt = h * 0.62
  ctx.fillStyle = 'rgba(8,12,18,0.5)'
  ctx.fillRect(0, lt, w, h * 0.24)
  ctx.fillStyle = '#ff6a3d'
  ctx.fillRect(w * 0.06, lt + h * 0.05, w * 0.014, h * 0.14)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${Math.round(h * 0.1)}px "Helvetica Neue", Arial, sans-serif`
  ctx.fillText('Ryan Kuru', w * 0.1, lt + h * 0.13)
  ctx.fillStyle = '#b8c3ce'
  ctx.font = `${Math.round(h * 0.066)}px "Helvetica Neue", Arial, sans-serif`
  ctx.fillText('My Professional Journey', w * 0.1, lt + h * 0.21)

  // progress bar + timecode (visually loops a fake 2:36 runtime)
  const dur = 156
  const loop = 14
  const p = (t % loop) / loop
  const py = h * 0.93
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillRect(w * 0.06, py, w * 0.74, 2)
  ctx.fillStyle = '#ff6a3d'
  ctx.fillRect(w * 0.06, py, w * 0.74 * p, 2)
  ctx.beginPath()
  ctx.arc(w * 0.06 + w * 0.74 * p, py + 1, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `${Math.round(h * 0.055)}px "Helvetica Neue", Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText(`${fmt(p * dur)} / ${fmt(dur)}`, w * 0.94, py + h * 0.02)
}

export default function ComputerScreen({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const screen = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { ctx, texture, w: canvas.width, h: canvas.height }
  }, [])

  const lastDraw = useRef(0)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (t - lastDraw.current < 0.1) return // throttle the placeholder video to ~10fps (cheaper, still reads as live)
    lastDraw.current = t
    drawVideo(screen.ctx, screen.w, screen.h, t)
    screen.texture.needsUpdate = true
  })

  const hingeZ = -DECK_D / 2 + 0.01

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* base deck */}
      <RoundedBox args={[W, DECK_T, DECK_D]} radius={0.006} smoothness={3} position={[0, DECK_T / 2 + 0.002, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BODY} roughness={0.4} metalness={0.6} />
      </RoundedBox>
      {/* keyboard area (dark, toward the hinge) */}
      <mesh position={[0, DECK_T + 0.003, -0.03]}>
        <boxGeometry args={[0.3, 0.003, 0.12]} />
        <meshStandardMaterial color="#26282b" roughness={0.7} />
      </mesh>
      {/* trackpad (front) */}
      <mesh position={[0, DECK_T + 0.003, 0.075]}>
        <boxGeometry args={[0.12, 0.003, 0.07]} />
        <meshStandardMaterial color="#5a5d62" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* screen lid — hinged at the back, leaning back */}
      <group position={[0, DECK_T + 0.004, hingeZ]} rotation={[-0.28, 0, 0]}>
        <RoundedBox args={[W, SCREEN_H, SCREEN_T]} radius={0.006} smoothness={3} position={[0, SCREEN_H / 2, 0]} castShadow>
          <meshStandardMaterial color={BODY} roughness={0.4} metalness={0.6} />
        </RoundedBox>
        {/* live placeholder video — unlit so the screen reads as "on" in the dark room */}
        <mesh position={[0, SCREEN_H / 2, SCREEN_T / 2 + 0.002]}>
          <planeGeometry args={[W - 0.03, SCREEN_H - 0.03]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        {/* faint cool screen-glow onto the keyboard/desk */}
        <pointLight position={[0, SCREEN_H / 2, 0.09]} intensity={0.35} distance={0.55} decay={2} color="#9fc4ec" />
      </group>
    </group>
  )
}
