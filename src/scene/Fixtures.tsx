import { useEffect } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { FIXTURES } from '../config/layout'
import { useViewStore } from '../store/useViewStore'
import { useZoomStore } from '../store/useZoomStore'
import { useReaderStore } from '../store/useReaderStore'
import { useDiscoveryStore } from '../store/useDiscoveryStore'
import { AREAS } from '../config/content'
import { useUiStore } from '../store/useUiStore'
import EditableFixture from './EditableFixture'
import { itemHandlers, goToSection, type Handlers } from '../lib/useItemInteraction'
import Desk from '../objects/Desk'
import FramedPhoto from '../objects/FramedPhoto'
import ComputerScreen from '../objects/ComputerScreen'
import Nameplate from '../objects/Nameplate'
import ResumeDeskStand from '../objects/ResumeDeskStand'
import EvolutionScreen from '../objects/EvolutionScreen'
import DeskChair from '../objects/DeskChair'
import DeskStool from '../objects/DeskStool'
import NewtonsCradle from '../objects/NewtonsCradle'
import CoffeeMug from '../objects/CoffeeMug'
import Jersey from '../objects/Jersey'
import TrophyShelf from '../objects/TrophyShelf'
import Present from '../objects/Present'

/**
 * Renders the fixtures from config via a type→component registry. In User view,
 * anything with a `zone` is clickable to zoom + center the camera on that area.
 * Adding an object later = create its component, add it here, add a FIXTURES entry.
 */
type ObjProps = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }

const REGISTRY: Record<string, (p: ObjProps) => JSX.Element> = {
  Desk,
  FramedPhoto,
  ComputerScreen,
  Nameplate,
  ResumeDeskStand,
  EvolutionScreen,
  DeskChair,
  DeskStool,
  NewtonsCradle,
  CoffeeMug,
  Jersey,
  TrophyShelf,
  Present,
}

export default function Fixtures() {
  const interactive = useViewStore((s) => s.mode) === 'user'
  const setZone = useZoomStore((s) => s.setZone)
  const zone = useZoomStore((s) => s.zone)
  const open = useReaderStore((s) => s.open)
  const readerSection = useReaderStore((s) => s.section)
  const setHover = useUiStore((s) => s.setHover)
  const markItemOpened = useDiscoveryStore((s) => s.markItemOpened)
  const markZoneVisited = useDiscoveryStore((s) => s.markZoneVisited)

  // The hint only exists to show where to click the first time, so it retires after interaction:
  //  - clicking into an area (zoom) marks the AREA visited → its lobby hint stops.
  //  - opening an item's reader marks the ITEM opened → its in-area hint stops.
  useEffect(() => {
    if (zone) markZoneVisited(zone)
  }, [zone, markZoneVisited])
  useEffect(() => {
    if (readerSection) markItemOpened(readerSection)
  }, [readerSection, markItemOpened])

  return (
    <group>
      {FIXTURES.map((f, i) => {
        const Comp = REGISTRY[f.type]
        if (!Comp) return null
        if (f.hideInZone && zone === f.hideInZone) return null
        const clickable = interactive && !!f.zone

        let handlers: Handlers = {}
        if (clickable) {
          if (f.section) {
            // Single-ITEM zone (e.g. the whiteboard): one click dollies in AND opens the
            // reader directly — no awkward "stare at the giant fixture" middle step.
            // Multi-item zones (desk/bulletin) keep the two-step: 1st click dollies in so
            // you can see the items, 2nd click opens the one you pick.
            const singleItem = (AREAS.find((a) => a.zone === f.zone)?.sections.length ?? 0) <= 1
            handlers = singleItem
              ? {
                  onClick: (e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation()
                    goToSection(f.section!)
                  },
                  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
                    e.stopPropagation()
                    document.body.style.cursor = 'pointer'
                  },
                  onPointerOut: () => {
                    document.body.style.cursor = 'auto'
                  },
                }
              : itemHandlers(f.zone!, f.section, zone, setZone, open)
          } else {
            // multi-section fixture (bulletin board): the outer group only dollies in;
            // its child papers carry their own per-section handlers.
            handlers = {
              onClick: (e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation()
                if (zone !== f.zone) setZone(f.zone!)
              },
              onPointerOver: (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              },
              onPointerOut: () => {
                document.body.style.cursor = 'auto'
              },
            }
          }
        }

        // surface a hover label (the area name) for the cursor tooltip
        if (clickable) {
          const label = AREAS.find((a) => a.zone === f.zone)?.label ?? ''
          const over = handlers.onPointerOver
          const out = handlers.onPointerOut
          handlers = {
            ...handlers,
            onPointerOver: (e: ThreeEvent<PointerEvent>) => {
              over?.(e)
              setHover(label)
            },
            onPointerOut: () => {
              out?.()
              setHover(null)
            },
          }
        }

        // Glow affordance removed (Ryan 2026-06-28: too distracting/overwhelming). Attention to
        // the three areas is now drawn by the cinematic entry sweep (CameraRig) + labels/hint pill.
        const canFloat = false
        const floatActive = false
        // EditableFixture owns the group transform (so the placement editor moves the real
        // object), the drag/click-select in Edit view, and the float hint in User view.
        return (
          <EditableFixture
            key={f.id}
            f={f}
            index={i}
            userHandlers={handlers}
            floatActive={floatActive}
            canFloat={canFloat}
            comp={<Comp />}
          />
        )
      })}
    </group>
  )
}
