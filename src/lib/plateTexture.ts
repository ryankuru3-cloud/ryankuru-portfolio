import * as THREE from 'three'

/**
 * Engraved brass nameplate texture: brass sheen background + beveled border, with
 * the name (larger) and email (smaller) in dark engraved-looking serif text. Cached.
 */
let cache: THREE.CanvasTexture | null = null

export function getPlateTexture(name: string, email: string): THREE.CanvasTexture {
  if (cache) return cache

  const w = 720
  const h = 170
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // brass sheen
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#cdad6e')
  g.addColorStop(0.5, '#a9853f')
  g.addColorStop(1, '#bd9750')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // beveled border
  ctx.strokeStyle = 'rgba(255,248,225,0.30)'
  ctx.lineWidth = 4
  ctx.strokeRect(9, 9, w - 18, h - 18)
  ctx.strokeStyle = 'rgba(70,48,12,0.45)'
  ctx.lineWidth = 2
  ctx.strokeRect(15, 15, w - 30, h - 30)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // name (engraved: dark fill + faint light offset for depth)
  ctx.font = '600 62px Georgia, "Times New Roman", serif'
  ctx.fillStyle = 'rgba(255,245,220,0.4)'
  ctx.fillText(name, w / 2 + 1.5, 66)
  ctx.fillStyle = '#3a2a0c'
  ctx.fillText(name, w / 2, 64)

  // email
  ctx.font = '600 42px Georgia, "Times New Roman", serif'
  ctx.fillStyle = 'rgba(255,245,220,0.35)'
  ctx.fillText(email, w / 2 + 1, 121)
  ctx.fillStyle = '#4a3713'
  ctx.fillText(email, w / 2, 120)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache = tex
  return tex
}
