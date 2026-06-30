import { useMemo } from 'react'
import * as THREE from 'three'
import { getPaperTexture } from '../lib/paperTexture'
import type { Vec3 } from '../config/layout'

/**
 * Résumé on a small ANGLED desk reading stand (a tablet/cookbook-style holder) that sits on the
 * desktop — the résumé is now an item in the About Me / desk area (not a floor lectern). Charcoal
 * metal stand with a brass sheet-lip, holding the résumé sheet (faux-document texture; the real PDF
 * opens in the reader). Origin at its base so it rests on the desktop. Clickable → Résumé.
 */
const TILT = -0.262 // board at ~75° from horizontal (steep/upright, only ~15° of lean-back)

export default function ResumeDeskStand({ position, rotation, scale }: { position?: Vec3; rotation?: Vec3; scale?: number }) {
  const paper = useMemo(() => getPaperTexture('Résumé'), [])
  const metal = { color: '#2c2f34', roughness: 0.42, metalness: 0.55 } as const
  const brass = { color: '#b8902f', roughness: 0.34, metalness: 0.9 } as const

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* base foot on the desktop */}
      <mesh position={[0, 0.009, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.17, 0.018, 0.12]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      {/* angled reading board (pivots at the back of the base, leaning back) */}
      <group position={[0, 0.018, -0.045]} rotation={[TILT, 0, 0]}>
        {/* dark board */}
        <mesh position={[0, 0.105, 0]} castShadow>
          <boxGeometry args={[0.185, 0.215, 0.012]} />
          <meshStandardMaterial color="#22242a" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* résumé sheet on the board face */}
        <mesh position={[0, 0.108, 0.0075]}>
          <planeGeometry args={[0.145, 0.185]} />
          <meshStandardMaterial map={paper} roughness={0.92} side={THREE.DoubleSide} />
        </mesh>
        {/* brass front lip cradling the sheet */}
        <mesh position={[0, 0.004, 0.014]} castShadow>
          <boxGeometry args={[0.185, 0.016, 0.018]} />
          <meshStandardMaterial {...brass} />
        </mesh>
      </group>
    </group>
  )
}
