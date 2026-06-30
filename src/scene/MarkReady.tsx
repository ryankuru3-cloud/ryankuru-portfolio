import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useUiStore } from '../store/useUiStore'

/**
 * Lives inside the Canvas: flips `sceneReady` true after a few rendered frames, so the
 * loading screen covers the initial 3D compile/first-paint and fades out only once the
 * scene is actually drawing. Then, once the scene has settled, it BAKES the shadow map ONCE
 * and stops per-frame shadow updates — the light + geometry are static (no chair, static
 * dashboard/screen; only the tiny Newton's-cradle balls move, imperceptibly), so this kills
 * a full shadow depth pass every frame. If you later add a moving/shadow-casting object or
 * change the lighting, flip `autoUpdate` back on (or re-bake) so its shadow updates.
 */
export default function MarkReady() {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  const ready = useRef(false)
  const baked = useRef(false)
  useFrame(() => {
    frames.current += 1
    if (!ready.current && frames.current >= 4) {
      ready.current = true
      useUiStore.getState().setSceneReady(true)
    }
    if (!baked.current && frames.current >= 45) {
      baked.current = true
      gl.shadowMap.needsUpdate = true // render the shadow map one final time…
      gl.shadowMap.autoUpdate = false // …then freeze it (no more per-frame depth pass)
    }
  })
  return null
}
