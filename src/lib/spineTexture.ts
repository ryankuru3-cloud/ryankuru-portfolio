import * as THREE from 'three'

/**
 * Generates a book-spine texture: the title set vertically on a colored spine,
 * with subtle accent bands. Auto-shrinks the font to fit long titles. Cached.
 */
const cache: Record<string, THREE.CanvasTexture> = {}

export function getSpineTexture(title: string, bg: string, fg: string): THREE.CanvasTexture {
  if (cache[title]) return cache[title]

  const w = 100
  const h = 560
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  // subtle accent bands near the ends
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(0, 26, w, 6)
  ctx.fillRect(0, h - 32, w, 6)

  // vertical title
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let fs = 56
  ctx.font = `600 ${fs}px Georgia, "Times New Roman", serif`
  while (ctx.measureText(title).width > h - 80 && fs > 22) {
    fs -= 2
    ctx.font = `600 ${fs}px Georgia, "Times New Roman", serif`
  }
  ctx.fillText(title, 0, 0)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache[title] = tex
  return tex
}
