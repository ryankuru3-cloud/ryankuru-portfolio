import * as THREE from 'three'

/**
 * Procedurally-drawn wood textures (self-contained — no external images).
 * Staggered boards, per-board tone variation, wavy grain, beveled seams.
 * One parameterized builder; cached per variant.
 */
type WoodOpts = {
  base: string
  tones: string[]
  rows: number
  minPW: number
  pwVar: number
  grainBase: number
  grainVar: number
  seamAlpha: number
  rowSeamAlpha: number
  edgeHi: string
  streakHi: string
}

function buildWoodTexture(o: WoodOpts): THREE.CanvasTexture {
  const S = 1024
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = o.base
  ctx.fillRect(0, 0, S, S)

  const plankH = S / o.rows
  for (let r = 0; r < o.rows; r++) {
    const y = r * plankH
    let x = -((r * 167) % 360) - 30
    while (x < S) {
      const pw = o.minPW + ((r * 83 + Math.floor(x) * 7) % o.pwVar)
      const tone = o.tones[(r * 3 + Math.floor((x + 600) / 130)) % o.tones.length]

      ctx.fillStyle = tone
      ctx.fillRect(x, y, pw, plankH)

      // wavy grain streaks
      for (let g = 0; g < 8; g++) {
        const gy = y + 4 + (g / 8) * (plankH - 8) + (Math.random() - 0.5) * 3
        ctx.strokeStyle = `rgba(0,0,0,${o.grainBase + Math.random() * o.grainVar})`
        ctx.lineWidth = 0.8 + Math.random() * 1.2
        ctx.beginPath()
        ctx.moveTo(x + 3, gy)
        for (let s = 1; s <= 6; s++) {
          const px = x + 3 + (s / 6) * (pw - 6)
          const py = gy + Math.sin(s * 1.6 + r) * 1.5 + (Math.random() - 0.5) * 1.3
          ctx.lineTo(px, py)
        }
        ctx.stroke()
      }

      // faint highlight along the board
      ctx.strokeStyle = o.streakHi
      ctx.lineWidth = 1
      ctx.beginPath()
      const hy = y + plankH * 0.4
      ctx.moveTo(x + 3, hy)
      ctx.lineTo(x + pw - 3, hy)
      ctx.stroke()

      // beveled seams
      ctx.fillStyle = `rgba(0,0,0,${o.seamAlpha})`
      ctx.fillRect(x + pw - 2, y, 2, plankH)
      ctx.fillRect(x, y + plankH - 2, pw, 2)
      ctx.fillStyle = o.edgeHi
      ctx.fillRect(x, y, pw, 1)

      x += pw
    }
    ctx.fillStyle = `rgba(0,0,0,${o.rowSeamAlpha})`
    ctx.fillRect(0, y + plankH - 1, S, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

let cachedFloor: THREE.CanvasTexture | null = null
export function getWoodFloorTexture(): THREE.CanvasTexture {
  if (!cachedFloor) {
    cachedFloor = buildWoodTexture({
      base: '#2f2015',
      tones: ['#4a3220', '#573b26', '#3f2b1b', '#503626', '#382517', '#5b3e28', '#45301e'],
      rows: 14,
      minPW: 150,
      pwVar: 150,
      grainBase: 0.04,
      grainVar: 0.06,
      seamAlpha: 0.3,
      rowSeamAlpha: 0.34,
      edgeHi: 'rgba(255,240,215,0.06)',
      streakHi: 'rgba(255,232,196,0.045)',
    })
  }
  return cachedFloor
}

let cachedOak: THREE.CanvasTexture | null = null
export function getOakDeskTexture(): THREE.CanvasTexture {
  if (!cachedOak) {
    cachedOak = buildWoodTexture({
      base: '#c7a877',
      tones: ['#cbae80', '#c4a576', '#c9aa7b', '#c0a070', '#cdb083'],
      rows: 4,
      minPW: 430,
      pwVar: 360,
      grainBase: 0.022,
      grainVar: 0.03,
      seamAlpha: 0.06,
      rowSeamAlpha: 0.08,
      edgeHi: 'rgba(255,248,232,0.10)',
      streakHi: 'rgba(150,110,60,0.04)',
    })
  }
  return cachedOak
}
