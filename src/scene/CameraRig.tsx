import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA, ZONES, type Vec3 } from '../config/layout'
import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'
import { useReaderStore } from '../store/useReaderStore'
import { usePlacementStore } from '../store/usePlacementStore'
import { useUiStore } from '../store/useUiStore'

/**
 * Camera + controls.
 *  - 'edit'  → free orbit, Garage-style (left-drag pan, right-drag rotate, scroll dolly).
 *  - 'user'  → locked. The camera smoothly dollies to the lobby pose, or to a zone's
 *              framing when a zone is active (click an area to zoom + center; Back/Esc/
 *              click-background returns to the lobby).
 */
const LOBBY = {
  position: new THREE.Vector3(...CAMERA.position),
  target: new THREE.Vector3(...CAMERA.target),
}
const ZONE_POSE: Record<string, { position: THREE.Vector3; target: THREE.Vector3 }> = {}
ZONES.forEach((z) => {
  ZONE_POSE[z.id] = {
    position: new THREE.Vector3(...z.camera.position),
    target: new THREE.Vector3(...z.camera.target),
  }
})

// Cinematic entry tour — on the first enter (User view), DOLLY INTO each area's actual framing,
// hold a beat, dolly back OUT to the lobby, then move on to the next: About Me → Work Portfolio
// → Professional Evolution. Starts & ends at the lobby pose so there's no snap in or out.
const LOBBY_POS = CAMERA.position
const LOBBY_TGT = CAMERA.target
// Each keyframe optionally tags the area it frames so other props (the desk chair) can react to
// the tour. Times are a touch slower than the first pass for a more deliberate feel.
const SWEEP_KF: { t: number; pos: Vec3; tgt: Vec3; zone?: string }[] = [
  { t: 0.0, pos: LOBBY_POS, tgt: LOBBY_TGT },
  { t: 1.0, zone: 'desk', pos: [-1.05, 1.92, 1.25], tgt: [-1.2, 1.5, -2.25] }, // dolly in → About Me (desk)
  { t: 1.4, zone: 'desk', pos: [-1.05, 1.92, 1.25], tgt: [-1.2, 1.5, -2.25] }, // hold
  { t: 2.4, pos: LOBBY_POS, tgt: LOBBY_TGT }, // dolly out
  { t: 3.4, zone: 'bulletin', pos: [2.0, 2.05, 3.8], tgt: [2.0, 1.2, -2.5] }, // dolly in → Work Portfolio (bulletin)
  { t: 3.8, zone: 'bulletin', pos: [2.0, 2.05, 3.8], tgt: [2.0, 1.2, -2.5] }, // hold
  { t: 4.8, pos: LOBBY_POS, tgt: LOBBY_TGT }, // dolly out
  { t: 5.8, zone: 'whiteboard', pos: [0.5, 1.72, 0.7], tgt: [-2.86, 1.6, 0.65] }, // dolly in → Professional Evolution (whiteboard)
  { t: 6.2, zone: 'whiteboard', pos: [0.5, 1.72, 0.7], tgt: [-2.86, 1.6, 0.65] }, // hold
  { t: 7.2, pos: LOBBY_POS, tgt: LOBBY_TGT }, // settle back to lobby
]
const SWEEP_POS = SWEEP_KF.map((k) => new THREE.Vector3(...k.pos))
const SWEEP_TGT = SWEEP_KF.map((k) => new THREE.Vector3(...k.tgt))
const SWEEP_END = SWEEP_KF[SWEEP_KF.length - 1].t
const INTRO_DELAY = 0 // tour starts immediately on enter (warmup hold removed — back to original)
const _p = new THREE.Vector3()
const _t = new THREE.Vector3()

const EDIT_BUTTONS = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
const VIEW_BUTTONS = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }

export default function CameraRig() {
  const mode = useViewStore((s) => s.mode)
  const zone = useZoomStore((s) => s.zone)
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const controls = useThree((s) => s.controls) as unknown as
    | { target?: THREE.Vector3; update?: () => void }
    | null
  const edit = mode === 'edit'
  const dragMode = usePlacementStore((s) => s.dragMode)
  const orbit = edit && !dragMode // freeze the camera while dragging a placement
  const entered = useUiStore((s) => s.entered)
  const setPreviewZone = useZoomStore((s) => s.setPreviewZone)
  const intro = useRef({ active: false, started: false, t0: -1 })
  const lastPreview = useRef<string | null>(null)

  // Kick off the cinematic entry sweep the first time the visitor enters (User view).
  useEffect(() => {
    if (entered && mode === 'user' && !intro.current.started) {
      intro.current = { active: true, started: true, t0: -1 }
    }
  }, [entered, mode])

  // Dev bridge (harmless): lets headless previews drive the stores for verification.
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    w.__zoom = useZoomStore
    w.__view = useViewStore
    w.__reader = useReaderStore
    w.__scene = scene
    w.__camera = camera
    w.__controls = controls
  }, [scene, camera, controls])

  // One-time: aim the camera at the lobby pose so the default (Edit) load frames the
  // room, not the floor origin. Done in the render loop where controls are ready.
  const inited = useRef(false)

  useFrame((state, dt) => {
    if (edit) {
      // free camera; just set the initial framing once
      if (!inited.current && controls?.target) {
        camera.position.copy(LOBBY.position)
        controls.target.copy(LOBBY.target)
        controls.update?.()
        inited.current = true
      }
      return
    }
    inited.current = true // user view manages the camera directly

    // Cinematic entry tour (first enter): dolly into each area, hold, dolly out, then release.
    if (intro.current.active) {
      if (zone) {
        intro.current.active = false // visitor clicked into an area → hand control back
        if (lastPreview.current !== null) (lastPreview.current = null), setPreviewZone(null)
      } else {
        if (intro.current.t0 < 0) intro.current.t0 = state.clock.elapsedTime + INTRO_DELAY
        const tt = state.clock.elapsedTime - intro.current.t0
        if (tt >= 0) {
          if (tt >= SWEEP_END) {
            intro.current.active = false
            if (lastPreview.current !== null) (lastPreview.current = null), setPreviewZone(null)
          } else {
            let i = 0
            while (i < SWEEP_KF.length - 1 && tt > SWEEP_KF[i + 1].t) i++
            // Sticky focus: carry the last tagged area forward across the dolly-out so a SLOW prop
            // (the desk chair) has the whole in→hold→out window to clear, and only rolls back once
            // the NEXT area takes focus. Drives DeskChair's roll-aside.
            let want: string | null = null
            for (let k = 0; k <= i + 1; k++) if (SWEEP_KF[k].zone) want = SWEEP_KF[k].zone as string
            if (lastPreview.current !== want) (lastPreview.current = want), setPreviewZone(want)
            const seg = (tt - SWEEP_KF[i].t) / (SWEEP_KF[i + 1].t - SWEEP_KF[i].t)
            const e = seg * seg * (3 - 2 * seg) // smoothstep ease
            _p.lerpVectors(SWEEP_POS[i], SWEEP_POS[i + 1], e)
            _t.lerpVectors(SWEEP_TGT[i], SWEEP_TGT[i + 1], e)
            camera.position.copy(_p)
            if (controls?.target) {
              controls.target.copy(_t)
              controls.update?.()
            } else {
              camera.lookAt(_t)
            }
            return
          }
        }
        // tt < 0 → warmup window: fall through to the normal lobby lerp so the scene settles first.
      }
    }

    const pose = (zone && ZONE_POSE[zone]) || LOBBY
    // settled → stop lerping + recomputing controls every frame (saves idle CPU at the lobby/zone)
    const tgt = controls?.target
    if (camera.position.distanceToSquared(pose.position) < 1e-7 && (!tgt || tgt.distanceToSquared(pose.target) < 1e-7)) return
    const a = 1 - Math.pow(0.0008, Math.min(dt, 0.05)) // frame-rate-independent easing
    camera.position.lerp(pose.position, a)
    if (tgt) {
      tgt.lerp(pose.target, a)
      controls.update?.()
    } else {
      camera.lookAt(pose.target)
    }
  })

  return (
    <OrbitControls
      makeDefault
      enableRotate={orbit}
      enableZoom={orbit}
      enablePan={orbit}
      enableDamping={edit}
      dampingFactor={0.08}
      screenSpacePanning={edit}
      mouseButtons={edit ? EDIT_BUTTONS : VIEW_BUTTONS}
      minDistance={0.3}
      maxDistance={60}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  )
}
