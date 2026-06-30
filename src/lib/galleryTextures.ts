import * as THREE from 'three'

/**
 * Procedural "photo" textures for the wall gallery + desk frame — University of Arizona +
 * finance + coding themed (stylized illustrations, in the room's flat low-poly spirit).
 * IP-safe: an ORIGINAL collegiate crest in Arizona's colors (cardinal red #AB0520 / navy
 * #0C234B) — NOT the trademarked Block-'A' / Wildcat mark — plus generic finance + code
 * motifs. Each texture is cached (built once).
 */

const RED = '#ab0520'
const NAVY = '#0c234b'
const GREEN = '#2ee27e'
const CREAM = '#e9d9b0'

function makeTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number, color: string) {
  const spikes = 5
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outer)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
    rot += step
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

// ---- University of Arizona: ORIGINAL collegiate crest (portrait) -------------
let emblem: THREE.CanvasTexture | null = null
export function getArizonaEmblemTexture(): THREE.CanvasTexture {
  if (emblem) return emblem
  emblem = makeTexture(420, 560, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#0e2a55')
    bg.addColorStop(1, '#07172f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2

    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = CREAM
    ctx.font = '600 22px Georgia, serif'
    ctx.fillText('UNIVERSITY OF', cx, 70)

    // shield
    const sy = 96
    const sw = 210
    const sh = 270
    const sx = cx - sw / 2
    const shield = () => {
      ctx.beginPath()
      ctx.moveTo(sx, sy + 20)
      ctx.quadraticCurveTo(sx, sy, sx + 20, sy)
      ctx.lineTo(sx + sw - 20, sy)
      ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + 20)
      ctx.lineTo(sx + sw, sy + sh * 0.52)
      ctx.quadraticCurveTo(sx + sw, sy + sh * 0.82, cx, sy + sh)
      ctx.quadraticCurveTo(sx, sy + sh * 0.82, sx, sy + sh * 0.52)
      ctx.closePath()
    }
    shield()
    ctx.fillStyle = RED
    ctx.fill()
    shield()
    ctx.lineWidth = 6
    ctx.strokeStyle = CREAM
    ctx.stroke()

    // star + "A" monogram (generic serif, not the athletic block A)
    star(ctx, cx, sy + 52, 17, 7, CREAM)
    ctx.fillStyle = '#f6eed5'
    ctx.font = 'bold 150px Georgia, "Times New Roman", serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('A', cx, sy + sh * 0.56)

    // name + year
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = CREAM
    ctx.font = 'bold 44px Georgia, serif'
    ctx.fillText('ARIZONA', cx, sy + sh + 56)
    ctx.fillStyle = 'rgba(233,217,176,0.72)'
    ctx.font = '600 18px Georgia, serif'
    ctx.fillText('EST. 1885', cx, sy + sh + 84)
  })
  return emblem
}

// ---- Finance: portfolio chart (landscape) -----------------------------------
let chart: THREE.CanvasTexture | null = null
export function getFinanceChartTexture(): THREE.CanvasTexture {
  if (chart) return chart
  chart = makeTexture(580, 400, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#0c1c39')
    bg.addColorStop(1, '#0a1224')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 1; i < 6; i++) {
      const y = (h * i) / 6
      ctx.beginPath()
      ctx.moveTo(36, y)
      ctx.lineTo(w - 18, y)
      ctx.stroke()
    }
    const n = 30
    const pts: [number, number][] = []
    let v = 0.32
    for (let i = 0; i < n; i++) {
      v += 0.018 + Math.sin(i * 0.8) * 0.025 + (i % 9 === 0 ? 0.05 : 0)
      const x = 36 + ((w - 54) * i) / (n - 1)
      const y = h - 34 - (h - 80) * Math.min(Math.max(v, 0), 0.96)
      pts.push([x, y])
    }
    const area = ctx.createLinearGradient(0, 40, 0, h)
    area.addColorStop(0, 'rgba(46,226,126,0.34)')
    area.addColorStop(1, 'rgba(46,226,126,0)')
    ctx.beginPath()
    ctx.moveTo(pts[0][0], h - 34)
    pts.forEach((p) => ctx.lineTo(p[0], p[1]))
    ctx.lineTo(pts[n - 1][0], h - 34)
    ctx.closePath()
    ctx.fillStyle = area
    ctx.fill()
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.strokeStyle = GREEN
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 30px Helvetica, Arial, sans-serif'
    ctx.fillText('PORTFOLIO', 36, 50)
    ctx.fillStyle = GREEN
    ctx.font = 'bold 23px Helvetica, Arial, sans-serif'
    ctx.fillText('▲ +28.4%', 36, 82)
  })
  return chart
}

// ---- Coding: a syntax-highlighted editor window (square) ---------------------
let coding: THREE.CanvasTexture | null = null
export function getCodingTexture(): THREE.CanvasTexture {
  if (coding) return coding
  coding = makeTexture(440, 440, (ctx, w, h) => {
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, w, h)
    // title bar
    ctx.fillStyle = '#161b22'
    ctx.fillRect(0, 0, w, 40)
    ;['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(24 + i * 22, 20, 6, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#8b949e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '14px Menlo, monospace'
    ctx.fillText('App.tsx', w / 2, 20)

    const C = {
      key: '#ff7b72',
      str: '#a5d6ff',
      fn: '#d2a8ff',
      tag: '#7ee787',
      attr: '#79c0ff',
      num: '#79c0ff',
      plain: '#c9d1d9',
    }
    const mono = '15px Menlo, Consolas, monospace'
    const lines: [string, string][][] = [
      [['import ', C.key], ['{ useState } ', C.plain], ['from ', C.key], ["'react'", C.str]],
      [],
      [['function ', C.key], ['App', C.fn], ['() {', C.plain]],
      [['  const ', C.key], ['[n, set] = ', C.plain], ['useState', C.fn], ['(', C.plain], ['0', C.num], [')', C.plain]],
      [['  return ', C.key], ['(', C.plain]],
      [['    <button ', C.tag], ['onClick', C.attr], ['={() => ', C.plain], ['set', C.fn], ['(n + ', C.plain], ['1', C.num], [')}>', C.plain]],
      [['      Clicks: {n}', C.plain]],
      [['    </button>', C.tag]],
      [['  )', C.plain]],
      [['}', C.plain]],
    ]
    const x0 = 46
    const y0 = 70
    const lh = 33
    ctx.textBaseline = 'alphabetic'
    lines.forEach((segs, i) => {
      const y = y0 + i * lh
      ctx.fillStyle = '#484f58'
      ctx.textAlign = 'right'
      ctx.font = '13px Menlo, monospace'
      ctx.fillText(String(i + 1), 34, y)
      ctx.textAlign = 'left'
      ctx.font = mono
      let x = x0
      segs.forEach(([t, c]) => {
        ctx.fillStyle = c
        ctx.fillText(t, x, y)
        x += ctx.measureText(t).width
      })
    })
  })
  return coding
}

// ---- University of Arizona: graduate portrait (desk frame) ------------------
let grad: THREE.CanvasTexture | null = null
export function getArizonaGradTexture(): THREE.CanvasTexture {
  if (grad) return grad
  grad = makeTexture(470, 610, (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h)
    bg.addColorStop(0, '#243456')
    bg.addColorStop(1, '#3a2f26')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    const glow = ctx.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.4, w * 0.7)
    glow.addColorStop(0, 'rgba(255,225,180,0.18)')
    glow.addColorStop(1, 'rgba(255,225,180,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2
    // gown (black shoulders)
    ctx.fillStyle = '#16161b'
    ctx.beginPath()
    ctx.moveTo(60, h)
    ctx.lineTo(70, h * 0.78)
    ctx.quadraticCurveTo(110, h * 0.66, cx, h * 0.62)
    ctx.quadraticCurveTo(w - 110, h * 0.66, w - 70, h * 0.78)
    ctx.lineTo(w - 60, h)
    ctx.closePath()
    ctx.fill()
    // navy stole with red trim
    ctx.fillStyle = NAVY
    ctx.fillRect(cx - 64, h * 0.64, 26, h * 0.36)
    ctx.fillRect(cx + 38, h * 0.64, 26, h * 0.36)
    ctx.fillStyle = RED
    ctx.fillRect(cx - 64, h * 0.64, 5, h * 0.36)
    ctx.fillRect(cx + 59, h * 0.64, 5, h * 0.36)
    // neck + head
    ctx.fillStyle = '#e3b98f' // skin tone
    ctx.fillRect(cx - 26, h * 0.5, 52, h * 0.14)
    ctx.beginPath()
    ctx.arc(cx, h * 0.42, 84, 0, Math.PI * 2)
    ctx.fill()
    // hair
    ctx.fillStyle = '#3a2a1c'
    ctx.beginPath()
    ctx.arc(cx, h * 0.4, 86, Math.PI * 1.05, Math.PI * 1.95)
    ctx.fill()
    // mortarboard cap
    ctx.fillStyle = '#16161b'
    ctx.beginPath()
    ctx.ellipse(cx, h * 0.3, 120, 30, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(cx - 42, h * 0.3 - 30, 84, 34)
    ctx.beginPath()
    ctx.arc(cx, h * 0.3 - 28, 8, 0, Math.PI * 2)
    ctx.fillStyle = RED
    ctx.fill()
    // tassel
    ctx.strokeStyle = RED
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(cx, h * 0.3 - 28)
    ctx.lineTo(cx + 116, h * 0.3 + 6)
    ctx.lineTo(cx + 116, h * 0.3 + 54)
    ctx.stroke()
    ctx.fillStyle = RED
    ctx.fillRect(cx + 108, h * 0.3 + 50, 16, 22)
  })
  return grad
}
