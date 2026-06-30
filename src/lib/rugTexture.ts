import * as THREE from 'three'

/**
 * Simple solid area-rug texture: a muted warm field with a faint woven texture and a
 * thin, low-contrast border so it reads as a rug (not a paint patch) without a busy
 * pattern. Drawn once and cached. Canvas aspect matches the rug slab (2.8 × 2.2).
 */
let cache: THREE.CanvasTexture | null = null

export function getRugTexture(): THREE.CanvasTexture {
  if (cache) return cache

  const w = 1024
  const h = 805 // matches the rug's W:D (2.8 : 2.2)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const FIELD = '#9c917b' // muted warm taupe
  const BORDER = '#867a62' // slightly darker, low-contrast border line
  const EDGE = '#6e6249' // darker edge binding

  // solid field
  ctx.fillStyle = FIELD
  ctx.fillRect(0, 0, w, h)

  // faint woven texture — very low-contrast horizontal pile striations + vertical warp
  ctx.globalAlpha = 0.04
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 3) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(w, y + 0.5)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.03
  ctx.strokeStyle = '#ffffff'
  for (let x = 0; x < w; x += 4) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // thin understated border line, inset from the edge
  const inset = h * 0.07
  ctx.strokeStyle = BORDER
  ctx.lineWidth = h * 0.012
  ctx.strokeRect(inset, inset, w - 2 * inset, h - 2 * inset)

  // darker edge binding at the perimeter
  const e = h * 0.014
  ctx.strokeStyle = EDGE
  ctx.lineWidth = h * 0.022
  ctx.strokeRect(e, e, w - 2 * e, h - 2 * e)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache = tex
  return tex
}
