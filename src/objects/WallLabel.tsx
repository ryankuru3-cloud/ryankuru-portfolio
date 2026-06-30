import { useMemo } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontData from 'three/examples/fonts/droid/droid_serif_bold.typeface.json'
import type { Vec3 } from '../config/layout'

/**
 * Real EXTRUDED 3D letters mounted flush on a wall — dimensional signage, not a flat
 * billboard. The geometry is centered (X+Y) so `position` places the text's center, and
 * the extrusion grows along +Z (local) out of the wall into the room; the back face sits
 * on the wall. For a side wall, pass rotation [0, ±π/2, 0] so it mounts on that wall.
 * Droid Serif ≈ a Times-New-Roman-style serif.
 *
 * A warm accent "picture light" sits just above + in front of each label, washing down
 * over the raised white letters so they read brightly and cast a crisp shadow on the wall.
 */
// Parse the serif font once at module scope.
const FONT = new FontLoader().parse(fontData as unknown as Parameters<InstanceType<typeof FontLoader>['parse']>[0])

export default function WallLabel({
  text,
  position,
  rotation,
  size = 0.15,
  depth = 0.035,
  light = true,
}: {
  text: string
  position?: Vec3
  rotation?: Vec3
  size?: number
  depth?: number
  light?: boolean
}) {
  const geo = useMemo(() => {
    const g = new TextGeometry(text, {
      font: FONT,
      size,
      depth, // extrusion out of the wall (three r17x key; older builds use `height`)
      height: depth,
      curveSegments: 5,
      bevelEnabled: false,
    } as ConstructorParameters<typeof TextGeometry>[1])
    g.computeBoundingBox()
    const bb = g.boundingBox!
    // center the text in X and Y; leave Z at 0 so the back face sits on the wall
    g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0)
    return g
  }, [text, size, depth])

  // aim point for the accent light: the face of the letters
  const target = useMemo(() => new THREE.Object3D(), [])

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f4ee" roughness={0.6} metalness={0.05} envMapIntensity={0.5} />
      </mesh>

      {/* warm accent "picture light": high + close to the wall so it RAKES down over the
          raised letters — bright enough that the white faces pop and each letter throws a
          crisp shadow below it (the shadow is what reads as "lit signage"). Offset scales
          with the label so it works at any size; small floating labels skip it (light=false). */}
      {light && (
        <>
          <primitive object={target} position={[0, -0.02, depth]} />
          <spotLight
            position={[0, size * 4.1, size * 3.3]}
            target={target}
            angle={0.85}
            penumbra={0.8}
            intensity={16}
            distance={3}
            decay={0}
            color="#ffe6ba"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0006}
            shadow-camera-near={0.15}
            shadow-camera-far={3}
          />
        </>
      )}
    </group>
  )
}
