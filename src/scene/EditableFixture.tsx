import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { usePlacementStore } from '../store/usePlacementStore'
import { useViewStore } from '../store/useViewStore'
import FloatHint from './FloatHint'
import type { FixtureDef } from '../config/layout'
import type { Handlers } from '../lib/useItemInteraction'

/**
 * Wraps one fixture: registers its placement slot, renders its LIVE transform (so the editor
 * moves the real object), and owns drag-to-move + click-to-select in Edit view. In User view it
 * passes through the normal zoom/open handlers + the float hint. Mirrors the Garage PlacementHelper.
 */
export default function EditableFixture({
  f,
  index,
  comp,
  userHandlers,
  floatActive,
  canFloat,
}: {
  f: FixtureDef
  index: number
  comp: ReactNode
  userHandlers: Handlers
  floatActive: boolean
  canFloat: boolean
}) {
  const editMode = useViewStore((s) => s.mode) === 'edit'
  const registerSlot = usePlacementStore((s) => s.registerSlot)
  const transform = usePlacementStore((s) => s.slots[f.id])
  const dragMode = usePlacementStore((s) => s.dragMode)
  const activeSlotId = usePlacementStore((s) => s.activeSlotId)
  const clickSelect = usePlacementStore((s) => s.clickSelect)
  const setActiveSlot = usePlacementStore((s) => s.setActiveSlot)
  const setPosition = usePlacementStore((s) => s.setPosition)

  useEffect(() => {
    registerSlot(f.id, {
      position: f.position,
      rotationX: f.rotation?.[0],
      rotationY: f.rotation?.[1] ?? 0,
      rotationZ: f.rotation?.[2],
      scale: f.scale ?? 1,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.id])

  const t =
    transform ?? {
      position: f.position,
      rotationX: f.rotation?.[0],
      rotationY: f.rotation?.[1] ?? 0,
      rotationZ: f.rotation?.[2],
      scale: f.scale ?? 1,
    }
  const locked = !!t.locked
  const draggable = editMode && dragMode && !locked && activeSlotId === f.id
  const pickable = editMode && clickSelect && !locked

  const plane = useRef(new THREE.Plane())
  const grab = useRef(new THREE.Vector3())
  const dragging = useRef(false)

  const editHandlers = {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (!draggable) return
      e.stopPropagation()
      ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
      plane.current.set(new THREE.Vector3(0, 1, 0), -t.position[1])
      const hit = new THREE.Vector3()
      if (e.ray.intersectPlane(plane.current, hit)) grab.current.set(t.position[0] - hit.x, 0, t.position[2] - hit.z)
      dragging.current = true
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || !draggable) return
      e.stopPropagation()
      const hit = new THREE.Vector3()
      if (!e.ray.intersectPlane(plane.current, hit)) return
      setPosition(f.id, [hit.x + grab.current.x, t.position[1], hit.z + grab.current.z])
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current) return
      e.stopPropagation()
      ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
      dragging.current = false
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!pickable) return
      e.stopPropagation()
      if (activeSlotId !== f.id) setActiveSlot(f.id)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (!pickable) return
      e.stopPropagation()
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      if (!pickable) return
      document.body.style.cursor = ''
    },
  }

  const handlers = editMode ? editHandlers : userHandlers
  const visual =
    editMode || !canFloat || f.selfHint ? (
      comp
    ) : (
      <FloatHint active={floatActive} phase={index * 1.3}>
        {comp}
      </FloatHint>
    )

  return (
    <group position={t.position} rotation={[t.rotationX ?? 0, t.rotationY, t.rotationZ ?? 0]} scale={t.scale} {...handlers}>
      {visual}
    </group>
  )
}
