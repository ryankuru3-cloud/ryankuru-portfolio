import * as THREE from 'three'

/**
 * Generates a "written document" paper texture: a real heading (e.g. "Resume" /
 * "Work Portfolio") at the top, then scribbled faux-text lines below — sub-header
 * scribbles + paragraphs of wavy lines of varying length — so the pinned papers
 * read as actual documents. The real content opens in the reader panel later.
 * Cached per title.
 */
const cache: Record<string, THREE.CanvasTexture> = {}

export function getPaperTexture(title: string): THREE.CanvasTexture {
  if (cache[title]) return cache[title]

  const W = 600
  const H = 800
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // paper + subtle border
  ctx.fillStyle = '#fcfbf7'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#ece7dd'
  ctx.lineWidth = 4
  ctx.strokeRect(3, 3, W - 6, H - 6)

  const margin = 64
  const usable = W - margin * 2

  // heading
  ctx.fillStyle = '#2a2a2a'
  ctx.font = '600 56px Georgia, "Times New Roman", serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(title, margin, 112)
  ctx.strokeStyle = '#bdb6a8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(margin, 138)
  ctx.lineTo(W - margin, 138)
  ctx.stroke()

  // wavy scribble line (faux text)
  const wave = (yc: number, len: number, color: string, lw: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lw
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(margin, yc)
    const steps = 26
    for (let i = 1; i <= steps; i++) {
      const x = margin + (i / steps) * len
      const yy = yc + Math.sin(i * 0.85 + yc * 0.05) * 2.2
      ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }

  let y = 196
  const paras = [
    { lines: 4 },
    { lines: 5 },
    { lines: 3 },
    { lines: 4 },
  ]
  paras.forEach((p) => {
    // sub-header scribble (shorter, darker)
    wave(y, usable * (0.32 + Math.random() * 0.14), '#6f665a', 9)
    y += 46
    // body lines
    for (let i = 0; i < p.lines; i++) {
      wave(y, usable * (0.58 + Math.random() * 0.4), '#a59c8d', 7)
      y += 34
    }
    y += 30
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache[title] = tex
  return tex
}
