import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SoftShadows, ContactShadows, Environment, Lightformer, Preload } from '@react-three/drei'
import { CAMERA } from '../config/layout'
import { useZoomStore } from '../store/useZoomStore'
import CameraRig from './CameraRig'
import MarkReady from './MarkReady'
import Lighting from './Lighting'
import Room from './Room'
import Fixtures from './Fixtures'
import Ambiance from './Ambiance'
import Labels from './Labels'

/**
 * The 3D stage. Transparent canvas (the CSS gradient backdrop shows through, so the
 * diorama "floats"), soft shadows, and a self-contained Lightformer environment for
 * gentle reflections. The camera + controls live in <CameraRig> (Edit vs User view).
 */
export default function Experience() {
  const setZone = useZoomStore((s) => s.setZone)
  return (
    <Canvas
      className="scene-canvas"
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.1, far: 100 }}
      onPointerMissed={() => setZone(null)}
    >
      <CameraRig />
      <MarkReady />
      <SoftShadows size={30} samples={8} focus={0.8} />
      <Suspense fallback={null}>
        <Lighting />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 0]} scale={[10, 10, 1]} />
          <Lightformer intensity={0.8} position={[6, 4, 6]} scale={[8, 8, 1]} />
          <Lightformer intensity={0.6} position={[-6, 3, 4]} scale={[8, 8, 1]} />
        </Environment>

        <Room />
        <Fixtures />
        <Ambiance />
        <Labels />

        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.5}
          scale={16}
          blur={2.4}
          far={6}
          resolution={512}
          frames={1}
          color="#241a10"
        />

        {/* Precompile every shader + upload every texture up front, so nothing compiles
            mid-move when the entry tour dollies new objects into view (kills the hitching). */}
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
