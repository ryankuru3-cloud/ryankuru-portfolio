import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Whiteboard that a marker animates SKETCHING into a personal-brand mind map: a central
 * "PERSONAL BRAND" hub with three branches — Core Values, Communication Style, Growth
 * Mindset — each with keyword notes (the three CER domains of the Professional Evolution
 * section; the full write-up lives in the click-through reader). The board is a live
 * CanvasTexture redrawn each frame: an ordered list of timed "ink" steps (boxes + connectors
 * drawn progressively, labels fading in) reveals over ~11s, holds, then loops. A small 3D
 * marker follows the pen and is tinted to the current ink. Built facing +Z; FIXTURES rotation
 * turns it to the wall.
 */
const W = 2.6
const H = 1.56
const FR = 0.05

const HAND = '"Bradley Hand", "Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive'
const INK = { black: '#23262b', blue: '#1f5fd0', red: '#c0392b', green: '#2e8b57', note: '#3b4046' }

type Step = {
  t0: number
  dur: number
  color: string
  draw: (ctx: CanvasRenderingContext2D, prog: number) => void
  pen?: (prog: number) => [number, number]
}

function lineLen(pts: number[][]) {
  let t = 0
  for (let i = 1; i < pts.length; i++) t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return t
}
function strokePoly(ctx: CanvasRenderingContext2D, pts: number[][], prog: number, color: string, w: number) {
  let target = lineLen(pts) * prog
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length && target > 0; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const d = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (target >= d) {
      ctx.lineTo(b[0], b[1])
      target -= d
    } else {
      const f = target / d
      ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
      target = 0
    }
  }
  ctx.stroke()
}
function pointAlong(pts: number[][], prog: number): [number, number] {
  let target = lineLen(pts) * prog
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const d = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (target <= d) {
      const f = d ? target / d : 0
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
    }
    target -= d
  }
  const last = pts[pts.length - 1]
  return [last[0], last[1]]
}
const rectPts = (x: number, y: number, w: number, h: number): number[][] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
  [x, y],
]

export default function Whiteboard({ position, rotation }: { position?: Vec3; rotation?: Vec3 }) {
  const markerRef = useRef<THREE.Group>(null)
  const anim = useRef({ last: -999, holdDone: false, prev: 0 })

  const board = useMemo(() => {
    const cw = 1024
    const ch = Math.round(cw * (H / W)) // 614
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4

    const steps: Step[] = []
    let cur = 0
    const add = (dur: number, color: string, draw: Step['draw'], pen?: Step['pen']) => {
      steps.push({ t0: cur, dur, color, draw, pen })
      cur += dur
    }
    const line = (pts: number[][], color: string, w: number, dur: number) =>
      add(dur, color, (c, p) => strokePoly(c, pts, p, color, w), (p) => pointAlong(pts, p))
    const text = (str: string, x: number, y: number, color: string, font: string, align: CanvasTextAlign, dur: number) =>
      add(
        dur,
        color,
        (c, p) => {
          c.save()
          c.globalAlpha = Math.min(1, p * 1.4)
          c.fillStyle = color
          c.font = font
          c.textAlign = align
          c.textBaseline = 'middle'
          c.fillText(str, x, y)
          c.restore()
        },
        () => [x, y],
      )

    // central hub
    line(rectPts(65, 245, 280, 128), INK.black, 5, 0.9)
    text('PERSONAL', 205, 290, INK.black, `700 38px ${HAND}`, 'center', 0.4)
    text('BRAND', 205, 332, INK.black, `700 38px ${HAND}`, 'center', 0.4)

    const branches = [
      {
        color: INK.blue,
        box: [435, 92, 300, 72],
        label: 'CORE VALUES',
        conn: [[345, 309], [392, 309], [392, 128], [435, 128]],
        notes: ['• Integrity', '• Analytical rigor', '• Curiosity'],
        ny: [100, 128, 156],
      },
      {
        color: INK.green,
        box: [435, 271, 300, 72],
        label: 'COMMUNICATION STYLE',
        conn: [[345, 309], [435, 307]],
        notes: ['• Clear & data-driven', '• Active listener', '• Collaborative'],
        ny: [279, 307, 335],
      },
      {
        color: INK.red,
        box: [435, 451, 300, 72],
        label: 'GROWTH MINDSET',
        conn: [[345, 309], [392, 309], [392, 487], [435, 487]],
        notes: ['• Seeks feedback', '• Iterates fast', '• Embraces challenge'],
        ny: [459, 487, 515],
      },
    ]
    for (const b of branches) {
      line(b.conn, b.color, 4, 0.55)
      line(rectPts(b.box[0], b.box[1], b.box[2], b.box[3]), b.color, 4.5, 0.7)
      text(b.label, b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2, b.color, `700 24px ${HAND}`, 'center', 0.5)
      b.notes.forEach((nt, i) => text(nt, 755, b.ny[i], INK.note, `400 22px ${HAND}`, 'left', 0.3))
    }

    const drawEnd = cur // sketch finishes here; the rest of the loop is a static hold
    const loop = cur + 4 // hold ~4s then loop
    return { ctx, texture, cw, ch, steps, loop, drawEnd }
  }, [])

  useFrame((s) => {
    const { ctx, texture, cw, ch, steps, loop, drawEnd } = board
    const t = s.clock.elapsedTime
    const elapsed = t % loop
    const a = anim.current
    if (elapsed < a.prev) a.holdDone = false // loop wrapped → sketch again
    a.prev = elapsed

    // Once fully drawn the board just holds — repaint ONCE then idle (skip the per-frame
    // 1024px canvas upload). During the sketch, throttle to ~30fps. Big GPU win.
    if (elapsed >= drawEnd) {
      if (a.holdDone) return
      a.holdDone = true
    } else if (t - a.last < 0.033) {
      return
    } else {
      a.last = t
    }

    ctx.fillStyle = '#fbfbfa'
    ctx.fillRect(0, 0, cw, ch)
    let pen: [number, number] | null = null
    let penColor = INK.black
    for (const st of steps) {
      if (elapsed < st.t0) break // steps are time-ordered
      const prog = Math.min(1, (elapsed - st.t0) / st.dur)
      st.draw(ctx, prog)
      if (elapsed <= st.t0 + st.dur && st.pen) {
        pen = st.pen(prog)
        penColor = st.color
      }
    }
    texture.needsUpdate = true

    const m = markerRef.current
    if (m) {
      if (pen) m.position.set((pen[0] / cw - 0.5) * W, (0.5 - pen[1] / ch) * H, 0.04)
      else m.position.set(-W * 0.36, -H / 2 - 0.02, 0.06) // park near the tray while holding
      const body = m.children[1] as THREE.Mesh
      if (body) (body.material as THREE.MeshStandardMaterial).color.set(penColor)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* aluminum frame */}
      <RoundedBox args={[W + FR * 2, H + FR * 2, 0.04]} radius={0.01} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#c7ccd1" roughness={0.35} metalness={0.7} envMapIntensity={0.6} />
      </RoundedBox>
      {/* live whiteboard surface */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={board.texture} roughness={0.34} metalness={0} />
      </mesh>
      {/* marker tray */}
      <mesh position={[0, -H / 2 - FR - 0.012, 0.05]} castShadow>
        <boxGeometry args={[W * 0.5, 0.03, 0.08]} />
        <meshStandardMaterial color="#b9bec3" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* animated marker (tip near board, body angled out) */}
      <group ref={markerRef} rotation={[0.5, 0, -0.35]}>
        <mesh position={[0, 0.012, 0]}>
          <coneGeometry args={[0.008, 0.03, 12]} />
          <meshStandardMaterial color="#333333" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.1, 16]} />
          <meshStandardMaterial color={INK.black} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
