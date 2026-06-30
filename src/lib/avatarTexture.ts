import * as THREE from 'three'

/**
 * Generic "default profile photo" silhouette — a clear head + shoulders bust on a
 * neutral grey background (no branded asset). Stands in for a headshot in the room
 * view; the real photo is shown in the bio panel later. Cached; built once.
 */
let cached: THREE.CanvasTexture | null = null

export function getAvatarTexture(): THREE.CanvasTexture {
  if (cached) return cached

  const W = 512
  const H = 756
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // soft neutral background
  ctx.fillStyle = '#ccd1d7'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#878d95'

  // shoulders / upper torso: neck at center-top, sloping down-out to the shoulder
  // tips, then straight down to the cropped bottom edge.
  ctx.beginPath()
  ctx.moveTo(72, H)
  ctx.lineTo(72, 575)
  ctx.quadraticCurveTo(95, 470, 256, 446)
  ctx.quadraticCurveTo(417, 470, 440, 575)
  ctx.lineTo(440, H)
  ctx.closePath()
  ctx.fill()

  // head
  ctx.beginPath()
  ctx.arc(256, 312, 106, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  cached = tex
  return tex
}
