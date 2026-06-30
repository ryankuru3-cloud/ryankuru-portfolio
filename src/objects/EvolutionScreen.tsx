import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'

/**
 * Professional Evolution preview — a wall-mounted glowing DATA DASHBOARD (replaced the old
 * whiteboard mind-map, which clashed with the section's polished navy data report). A live
 * CanvasTexture builds the section's actual data viz — a "top motivators" bar chart that grows,
 * the self-perception-vs-reputation social-styles scatter that plots its two points + arrow, and
 * the "how others describe me" adjective tags that pop in — in the Arizona navy/red palette, then
 * holds ~4s and loops. Same efficient repaint pattern as the old board (throttle during the build,
 * idle on the hold). Built facing +Z; the FIXTURES rotation turns it to the left wall.
 */
const W = 2.6
const H = 1.56
const BEZEL = 0.055

const FONT = '"Inter", system-ui, -apple-system, sans-serif'
const NAVY_TOP = '#0a1830'
const NAVY_BOT = '#0c2347'
const CARD = '#0f2750'
const CARD_LINE = 'rgba(130,160,210,0.18)'
const WHITE = '#f2f6fc'
const SLATE = '#9fb4d0'
const SLATE_DIM = '#7d93b3'
const RED = '#ef4056'
const BLUE = '#5b9bd5'
const GREEN = '#46d39a'

const cl = (x: number) => Math.max(0, Math.min(1, x))
const ease = (x: number) => 1 - Math.pow(1 - cl(x), 3) // easeOutCubic

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

const DRAW_END = 6.7 // build completes here; the rest of the loop is a static hold
const LOOP = 11

export default function EvolutionScreen({ position, rotation }: { position?: Vec3; rotation?: Vec3 }) {
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
    return { ctx, texture, cw, ch }
  }, [])

  function draw(ctx: CanvasRenderingContext2D, cw: number, ch: number, e: number) {
    const pad = 28
    // ---- background ----
    const g = ctx.createLinearGradient(0, 0, 0, ch)
    g.addColorStop(0, NAVY_TOP)
    g.addColorStop(1, NAVY_BOT)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, cw, ch)

    // ---- header ----
    const hA = ease(e / 0.8)
    ctx.save()
    ctx.globalAlpha = hA
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = RED
    ctx.font = `600 15px ${FONT}`
    ctx.fillText('P R O F E S S I O N A L   E V O L U T I O N', pad, 34)
    ctx.fillStyle = WHITE
    ctx.font = `600 28px ${FONT}`
    ctx.fillText('How I see myself vs. how others do', pad, 68)
    const pulse = 0.5 + 0.5 * Math.sin(e * 3)
    ctx.fillStyle = `rgba(70,211,154,${0.35 + 0.65 * pulse})`
    ctx.beginPath()
    ctx.arc(cw - pad - 104, 30, 5, 0, 7)
    ctx.fill()
    ctx.fillStyle = SLATE
    ctx.font = `600 13px ${FONT}`
    ctx.fillText('SPI · 360 · PRS', cw - pad - 92, 35)
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, 90)
    ctx.lineTo(cw - pad, 90)
    ctx.stroke()

    const cardA = ease((e - 0.6) / 0.5)
    const card = (x: number, y: number, w: number, h: number) => {
      ctx.save()
      ctx.globalAlpha = cardA
      rr(ctx, x, y, w, h, 12)
      ctx.fillStyle = CARD
      ctx.fill()
      ctx.strokeStyle = CARD_LINE
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    // ---- card 1: bar chart (top motivators) ----
    const c1x = pad
    const c1y = 116
    const c1w = 452
    const c1h = 300
    card(c1x, c1y, c1w, c1h)
    ctx.save()
    ctx.globalAlpha = cardA
    ctx.textAlign = 'left'
    ctx.fillStyle = SLATE
    ctx.font = `600 15px ${FONT}`
    ctx.fillText('TOP MOTIVATORS', c1x + 22, c1y + 34)
    ctx.fillStyle = SLATE_DIM
    ctx.font = `400 12px ${FONT}`
    ctx.fillText('SPI self-assessment · out of 100', c1x + 22, c1y + 54)
    ctx.restore()
    const bars: [string, number][] = [
      ['Helping others', 98],
      ['Stability', 97],
      ['Drive to compete', 95],
    ]
    const trackX = c1x + 22
    const trackW = c1w - 44
    bars.forEach((b, i) => {
      const rowY = c1y + 96 + i * 62
      const bp = ease((e - (1.0 + i * 0.4)) / 1.1)
      ctx.save()
      ctx.globalAlpha = cardA
      ctx.textAlign = 'left'
      ctx.fillStyle = '#cdd8e6'
      ctx.font = `500 16px ${FONT}`
      ctx.fillText(b[0], trackX, rowY - 8)
      ctx.textAlign = 'right'
      ctx.fillStyle = WHITE
      ctx.font = `700 20px ${FONT}`
      ctx.fillText(String(Math.round(b[1] * bp)), trackX + trackW, rowY - 5)
      rr(ctx, trackX, rowY + 4, trackW, 12, 6)
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fill()
      const fw = trackW * (b[1] / 100) * bp
      if (fw > 1) {
        rr(ctx, trackX, rowY + 4, fw, 12, 6)
        ctx.fillStyle = BLUE
        ctx.fill()
      }
      ctx.restore()
    })

    // ---- card 2: social-styles scatter ----
    const c2x = 502
    const c2y = 116
    const c2w = 494
    const c2h = 300
    card(c2x, c2y, c2w, c2h)
    ctx.save()
    ctx.globalAlpha = cardA
    ctx.textAlign = 'left'
    ctx.fillStyle = SLATE
    ctx.font = `600 15px ${FONT}`
    ctx.fillText('SELF-PERCEPTION  vs.  REPUTATION', c2x + 22, c2y + 34)
    ctx.restore()
    const px = c2x + 92
    const py = c2y + 64
    const pw = 208
    const ph = 178
    const axA = ease((e - 2.6) / 0.7)
    ctx.save()
    ctx.globalAlpha = cardA * axA
    ctx.fillStyle = 'rgba(239,64,86,0.12)'
    ctx.fillRect(px + pw / 2, py, pw / 2, ph / 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1.2
    ctx.strokeRect(px, py, pw, ph)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.moveTo(px + pw / 2, py)
    ctx.lineTo(px + pw / 2, py + ph)
    ctx.moveTo(px, py + ph / 2)
    ctx.lineTo(px + pw, py + ph / 2)
    ctx.stroke()
    ctx.font = `600 12px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillStyle = RED
    ctx.fillText('Expressive', px + pw - 6, py + 16)
    ctx.fillStyle = '#8aa0bb'
    ctx.fillText('Driver', px + pw - 6, py + ph - 8)
    ctx.textAlign = 'left'
    ctx.fillText('Amiable', px + 6, py + 16)
    ctx.fillText('Analytical', px + 6, py + ph - 8)
    ctx.textAlign = 'center'
    ctx.fillStyle = SLATE_DIM
    ctx.font = `500 11px ${FONT}`
    ctx.fillText('Proactivity →', px + pw / 2, py + ph + 22)
    ctx.translate(px - 22, py + ph / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Reactivity →', 0, 0)
    ctx.restore()
    // points
    const selfP = ease((e - 3.6) / 0.4)
    const repP = ease((e - 4.0) / 0.4)
    const arrP = ease((e - 4.3) / 0.5)
    const selfX = px + pw * 0.62
    const selfY = py + ph * 0.5
    const repX = px + pw * 0.75
    const repY = py + ph * 0.31
    if (arrP > 0) {
      ctx.save()
      ctx.globalAlpha = cardA
      ctx.strokeStyle = RED
      ctx.lineWidth = 1.6
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(selfX, selfY)
      ctx.lineTo(selfX + (repX - selfX) * arrP, selfY + (repY - selfY) * arrP)
      ctx.stroke()
      ctx.restore()
    }
    if (selfP > 0) {
      ctx.save()
      ctx.globalAlpha = cardA * selfP
      ctx.fillStyle = NAVY_BOT
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(selfX, selfY, 7, 0, 7)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
    if (repP > 0) {
      ctx.save()
      ctx.globalAlpha = cardA * repP
      ctx.fillStyle = RED
      ctx.beginPath()
      ctx.arc(repX, repY, 7.5, 0, 7)
      ctx.fill()
      ctx.restore()
    }
    // legend
    ctx.save()
    ctx.globalAlpha = cardA * selfP
    ctx.textAlign = 'left'
    ctx.font = `500 13px ${FONT}`
    ctx.textBaseline = 'middle'
    const lx = px + pw + 34
    ctx.fillStyle = NAVY_BOT
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(lx, py + 44, 5, 0, 7)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = SLATE
    ctx.fillText('how I see me', lx + 14, py + 45)
    ctx.fillStyle = RED
    ctx.beginPath()
    ctx.arc(lx, py + 70, 5, 0, 7)
    ctx.fill()
    ctx.fillStyle = SLATE
    ctx.fillText('how others do', lx + 14, py + 71)
    ctx.textBaseline = 'alphabetic'
    ctx.restore()

    // ---- bottom strip: adjective tags ----
    const sy = 432
    ctx.save()
    ctx.globalAlpha = ease((e - 4.6) / 0.5)
    ctx.textAlign = 'left'
    ctx.fillStyle = SLATE
    ctx.font = `600 14px ${FONT}`
    ctx.fillText('HOW OTHERS DESCRIBE ME', pad, sy + 8)
    ctx.restore()
    const tags: [string, boolean][] = [
      ['Self-Confident', true],
      ['Social', true],
      ['Easygoing', true],
      ['Spontaneous', true],
      ['Calm', false],
      ['Even-Tempered', false],
      ['Outgoing', false],
    ]
    let tx = pad
    let ty = sy + 30
    tags.forEach((tg, i) => {
      const tp = ease((e - (4.9 + i * 0.18)) / 0.35)
      if (tp <= 0) return
      const big = tg[1]
      ctx.font = `${big ? '700' : '500'} ${big ? 20 : 16}px ${FONT}`
      const tw = ctx.measureText(tg[0]).width
      const padX = big ? 18 : 14
      const h = big ? 40 : 32
      if (tx + tw + padX * 2 > cw - pad) {
        tx = pad
        ty += 50
      }
      ctx.save()
      ctx.globalAlpha = tp
      rr(ctx, tx, ty, tw + padX * 2, h, h / 2)
      ctx.fillStyle = big ? RED : 'rgba(255,255,255,0.06)'
      ctx.fill()
      if (!big) {
        ctx.strokeStyle = 'rgba(239,64,86,0.4)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.fillStyle = big ? '#ffffff' : '#dce6f2'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(tg[0], tx + padX, ty + h / 2 + 1)
      ctx.textBaseline = 'alphabetic'
      ctx.restore()
      tx += tw + padX * 2 + 12
    })
  }

  // Static: paint the fully-built dashboard ONCE, then never touch the canvas again (no per-frame
  // build/upload loop). Still reads as the section; just doesn't animate. (Ryan, for perf.)
  useFrame(() => {
    const a = anim.current
    if (a.holdDone) return
    a.holdDone = true
    const { ctx, texture, cw, ch } = board
    draw(ctx, cw, ch, DRAW_END)
    texture.needsUpdate = true
  })

  return (
    <group position={position} rotation={rotation}>
      {/* dark monitor bezel */}
      <RoundedBox args={[W + BEZEL * 2, H + BEZEL * 2, 0.05]} radius={0.012} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#0e1116" roughness={0.45} metalness={0.6} envMapIntensity={0.5} />
      </RoundedBox>
      {/* glowing screen */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={board.texture} emissive="#ffffff" emissiveMap={board.texture} emissiveIntensity={1.15} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  )
}
