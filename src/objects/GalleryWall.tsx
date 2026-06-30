import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../config/layout'
import { getArizonaEmblemTexture, getFinanceChartTexture, getCodingTexture } from '../lib/galleryTextures'

/**
 * A small gallery set: a cluster of framed pieces mounted on a wall — University of Arizona
 * + finance + coding "photos". The left frame shows the real Arizona logo IF you drop an
 * image at `public/textures/arizona-logo.png` (matted onto navy to fit any aspect); until
 * then it falls back to a placeholder crest (procedural, see lib/galleryTextures). Frames
 * extrude +Z out of the wall; the AMBIANCE rotation + scale orient/size the cluster.
 */
const FRAME = '#1c1c1f' // matte black frame
const LOGO_URL = '/textures/arizona-logo.png'

// each: [localX, localY, width, height]
const PIECES: [number, number, number, number][] = [
  [-0.2, 0.02, 0.32, 0.44], // left portrait (larger) — Arizona logo (file) / crest fallback
  [0.19, 0.21, 0.34, 0.24], // top-right landscape — finance chart
  [0.19, -0.15, 0.3, 0.3], // bottom-right square — coding editor
]

/** Load an optional user image, matted on navy to fit the frame; fall back if absent. */
function useLogoTexture(url: string, fallback: THREE.Texture): THREE.Texture {
  const [tex, setTex] = useState<THREE.Texture>(fallback)
  useEffect(() => {
    let active = true
    // HEAD-check first so a missing file doesn't spam the console with a 404.
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (!active || !r.ok) return
        const img = new Image()
        img.onload = () => {
          if (!active) return
          const W = 460
          const H = 600
          const c = document.createElement('canvas')
          c.width = W
          c.height = H
          const ctx = c.getContext('2d')!
          ctx.fillStyle = '#0c234b' // navy matte — matches the logo's background
          ctx.fillRect(0, 0, W, H)
          const s = Math.min(W / img.width, H / img.height) * 0.94 // contain-fit, small margin
          const dw = img.width * s
          const dh = img.height * s
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
          const t = new THREE.CanvasTexture(c)
          t.colorSpace = THREE.SRGBColorSpace
          t.anisotropy = 4
          setTex(t)
        }
        img.src = url
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      active = false
    }
  }, [url, fallback])
  return tex
}

export default function GalleryWall({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const crest = useMemo(() => getArizonaEmblemTexture(), [])
  const logo = useLogoTexture(LOGO_URL, crest)
  const chart = useMemo(() => getFinanceChartTexture(), [])
  const coding = useMemo(() => getCodingTexture(), [])
  const tex = [logo, chart, coding]

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {PIECES.map(([x, y, w, h], i) => (
        <group key={i} position={[x, y, 0]}>
          {/* frame */}
          <mesh position={[0, 0, 0.012]} castShadow>
            <boxGeometry args={[w + 0.04, h + 0.04, 0.024]} />
            <meshStandardMaterial color={FRAME} roughness={0.5} metalness={0.2} />
          </mesh>
          {/* themed picture panel */}
          <mesh position={[0, 0, 0.026]}>
            <boxGeometry args={[w, h, 0.006]} />
            <meshStandardMaterial map={tex[i]} roughness={0.7} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
