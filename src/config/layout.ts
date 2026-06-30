/**
 * Single source of truth for the scene layout.
 *
 * Coordinates: three.js, Y-up, floor centered at the origin.
 * The room is a cutaway "dollhouse": back wall (z = -depth/2) + left wall (x = -width/2)
 * are kept; the front (+Z) and right (+X) sides are open so the static isometric camera
 * looks in. No ceiling.
 */

export type Vec3 = [number, number, number]

export const ROOM = {
  width: 6, // X
  depth: 6, // Z
  height: 3.0, // Y
  wall: 0.12, // wall thickness
}

export const WINDOW = {
  width: 1.8,
  height: 1.3,
  sill: 1.15, // height of the opening's bottom edge
  centerX: 0,
}

/**
 * Fixed isometric camera. The view is static (no OrbitControls). A per-zone `camera`
 * target is added in the interaction pass for the click-to-dolly move.
 */
export const CAMERA = {
  // Open-top "dollhouse" view (no ceiling/fan): raised 3/4 angle looking down into the
  // room so both walls + floor + desk read, with the open top framed as background.
  position: [6.6, 2.95, 6.6] as Vec3,
  target: [-0.25, 1.45, -0.7] as Vec3,
  fov: 31,
}

/**
 * ROADMAP STUBS — filled in during later passes (see the project plan).
 *
 * ZONES: the three clickable zone anchors and their in-world content items.
 *   { id, label, camera, items: [{ id, section, title, content }] }
 *   - desk      → framedPhoto/bio, computerScreen/personaVideo, nameplate/contact
 *   - bulletin  → resume (pinned sheet), portfolio (second pinned piece)
 *   - whiteboard→ evolution
 *   `content` points to the PDF/HTML shown in the near-full-screen reader.
 *   6 items map 1:1 to the 6 required sections.
 *
 * FIXTURES: rendered objects (desk + the in-world clickable objects).
 *   { id, type, position, rotation, zone, clickable }
 *
 * AMBIANCE: non-clickable animated props (clock, bookshelf, fan, cradle, mug).
 *   { id, type, position, rotation }
 */
export type ZoneDef = {
  id: string
  label: string
  camera: { position: Vec3; target: Vec3 }
}

// The "areas" you can click to zoom + center on (in User view). Each pose is a camera
// position + look-at target that frames that area. (The internal id 'bulletin' is kept
// for the Work Portfolio zone so the discovery store + Jersey exhibit keep working.)
export const ZONES: ZoneDef[] = [
  // About Me / desk — framing pulled slightly forward + down to include the front-center résumé stand.
  { id: 'desk', label: 'About', camera: { position: [-1.05, 1.92, 1.25], target: [-1.2, 1.5, -2.25] } },
  { id: 'bulletin', label: 'Work', camera: { position: [2.0, 2.05, 3.8], target: [2.0, 1.2, -2.5] } },
  { id: 'whiteboard', label: 'Evolution', camera: { position: [0.5, 1.72, 0.7], target: [-2.86, 1.6, 0.65] } },
]

// Desk top surface height — the top sits 20% of the window height above the sill.
// Shared so on-desk items (photo, screen, nameplate) rest exactly on the surface.
export const DESK_TOP = WINDOW.sill + 0.2 * WINDOW.height

export type FixtureDef = {
  id: string
  type: string
  position: Vec3
  rotation?: Vec3
  scale?: number
  zone?: string
  clickable?: boolean
  section?: string // content section opened on the 2nd click (see config/content.ts). Omitted for
  // multi-section fixtures like the bulletin board, whose child papers each carry their own section.
  hideInZone?: string // hidden while zoomed into this zone (e.g. the chair clears out for the desk close-up)
  noLift?: boolean // (legacy, now a no-op: the hint is glow-only — kept so old fixtures still typecheck)
  selfHint?: boolean // the object runs its OWN glow hint (skip the generic FloatHint wrapper)
  hintInZoneOnly?: boolean // don't glow in the lobby — only glow once zoomed into its zone (desk items)
}

export const FIXTURES: FixtureDef[] = [
  // Large modern-minimalist desk under the window. It's the clickable "About Me" area target and the
  // only thing that glows in the lobby (its on-desk items hint only once you've zoomed in).
  { id: 'desk', type: 'Desk', position: [-1.13, 0, -2.355], rotation: [0, 0, 0], zone: 'desk', clickable: true },
  // (No desk chair — Ryan wants an open desk. Nothing to render/animate here.)
  // Desk items in ONE evenly-spaced row (Δx ≈ 0.62, centered on the desk): Video (left) ·
  // Bio · Résumé · Contact (right). Bio + Résumé are the FOCAL pair — enlarged and nudged a
  // touch forward (z=-2.28) so they read as the centerpieces; Video + Contact sit just back.
  // Framed photo on the desk → Bio & headshot. A focal point: enlarged and slightly forward.
  { id: 'framedPhoto', type: 'FramedPhoto', position: [-1.42, DESK_TOP, -2.28], rotation: [-0.06, 0.12, 0], scale: 1.6, zone: 'desk', clickable: true, section: 'bio', hintInZoneOnly: true },
  // MacBook on the LEFT of the row → Persona video. Yawed slightly toward the camera.
  { id: 'computerScreen', type: 'ComputerScreen', position: [-2.05, DESK_TOP, -2.40], rotation: [0, 0.18, 0], scale: 1.4, zone: 'desk', clickable: true, section: 'video', hintInZoneOnly: true },
  // Nameplate on the RIGHT of the row → Contact. Yawed slightly toward the camera.
  { id: 'nameplate', type: 'Nameplate', position: [-0.18, DESK_TOP, -2.40], rotation: [0, -0.10, 0], zone: 'desk', clickable: true, section: 'contact', hintInZoneOnly: true },
  // Newton's cradle (animated desk toy), back-left corner of the desk — left of + behind the photo.
  { id: 'cradle', type: 'NewtonsCradle', position: [-2.55, DESK_TOP, -2.75], rotation: [0, 0.3, 0], zone: 'desk', clickable: false },
  // Coffee mug with animated steam — back-right corner of the desk, scaled up 30%.
  { id: 'mug', type: 'CoffeeMug', position: [0.38, DESK_TOP, -2.72], rotation: [0, 0.6, 0], scale: 1.3, zone: 'desk', clickable: false },
  // Résumé on an angled reading stand → the other FOCAL point, beside the photo. Enlarged to scale 1.6
  // so the sheet reads as a real ~letter-size page on the desk; nudged forward (z=-2.28) like the photo.
  { id: 'resumeStand', type: 'ResumeDeskStand', position: [-0.80, DESK_TOP, -2.28], rotation: [0, -0.08, 0], scale: 1.6, zone: 'desk', clickable: true, section: 'resume', hintInZoneOnly: true },
  // Wall monitor on the left wall → Professional Evolution (animated data dashboard).
  { id: 'whiteboard', type: 'EvolutionScreen', position: [-2.86, 1.62, 0.65], rotation: [0, Math.PI / 2, 0], zone: 'whiteboard', clickable: true, section: 'evolution' },
  // Standing Arizona jersey EXHIBIT (tall walnut stand + spotlight) → Jersey Concept project. Runs its OWN
  // float+glow hint (whole piece lifts together; spotlight pulses so the JERSEY is the focal point).
  { id: 'jersey', type: 'Jersey', position: [2.51, 0, -2.34], rotation: [0, -0.7, 0], scale: 1.69, zone: 'bulletin', clickable: true, section: 'jersey', selfHint: true },
  // DECA "Arizona" competition trophy on a STATIC wall-mounted walnut shelf (no pedestal) →
  // Competition Trophy. Mounted on the back wall; only its display light pulses for the hint.
  { id: 'trophy', type: 'TrophyShelf', position: [1.8, 1.45, -2.87], rotation: [0, 0, 0], zone: 'bulletin', clickable: true, section: 'trophy', selfHint: true },
  // Gift present on the floor → Gifted project.
  { id: 'present', type: 'Present', position: [1.2, 0, -1.9], rotation: [0, -0.4, 0], zone: 'bulletin', clickable: true, section: 'gift' },
]

export type LabelDef = {
  id: string
  text: string
  position: Vec3
  rotation?: Vec3
  size?: number
  depth?: number
  light?: boolean
  hideInZone?: string // hidden while zoomed into this zone
  onlyInZone?: string // shown ONLY while zoomed into this zone
}

// Extruded 3D letters. The big ones are mounted FLUSH on the wall above each asset (back
// wall inner face z=-2.88, left wall inner face x=-2.88) with a warm accent light. The
// small ones float just above each desk item (no accent light — they read against the
// dark wall). Each is centered horizontally over its asset so it clearly reads as "above".
export const LABELS: LabelDef[] = [
  // On the back wall above the desk; the zone title. Hidden once you zoom into the desk.
  { id: 'lblDesk', text: 'About Me', position: [-1.13, 2.08, -2.878], rotation: [0, 0, 0], size: 0.16, hideInZone: 'desk' },
  // On the back wall above the work-portfolio exhibits, centered over the cluster (present/case/jersey).
  // Hidden once you zoom in — the small per-item sub-headers below take over (same as the desk title).
  { id: 'lblBulletin', text: 'Work Portfolio', position: [1.95, 2.42, -2.878], rotation: [0, 0, 0], size: 0.12, hideInZone: 'bulletin' },
  // On the LEFT wall above the whiteboard, centered on the board (z=0.65); rotated to mount on that wall.
  { id: 'lblWhiteboard', text: 'Professional Evolution', position: [-2.878, 2.62, 0.65], rotation: [0, Math.PI / 2, 0], size: 0.15 },

  // Small floating sub-headers centered above each desk item — ONLY shown when zoomed into the desk.
  // Each x matches its item; y floats ~0.12 above the item's top; z is nudged forward toward the camera.
  { id: 'lblComputer', text: 'Who I Am', position: [-2.05, 1.86, -2.30], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'desk' },
  { id: 'lblPhoto', text: 'Biography', position: [-1.42, 2.07, -2.18], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'desk' },
  { id: 'lblResume', text: 'Résumé', position: [-0.80, 2.06, -2.18], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'desk' },
  { id: 'lblNameplate', text: 'Contact Me', position: [-0.18, 1.66, -2.30], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'desk' },

  // Small floating sub-headers above each Work Portfolio item — ONLY shown when zoomed into the work zone
  // (mirrors the desk sub-headers above). Centered over each item, floating just above its top.
  { id: 'lblTrophy', text: 'Financial Service Trophy', position: [1.8, 2.06, -2.6], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'bulletin' },
  { id: 'lblJersey', text: 'ICON Project', position: [2.51, 2.45, -2.18], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'bulletin' },
  { id: 'lblPresent', text: 'Gifted', position: [1.2, 0.78, -1.72], rotation: [0, 0, 0], size: 0.05, depth: 0.013, light: false, onlyInZone: 'bulletin' },
]

export type AmbianceDef = { id: string; type: string; position: Vec3; rotation?: Vec3; scale?: number }

// Non-interactable ambiance props.
export const AMBIANCE: AmbianceDef[] = [
  // Floating walnut shelf centered above the desk; books drift in/out (one at a time).
  { id: 'shelf', type: 'HangingShelf', position: [-1.13, 2.22, -2.745], rotation: [0, 0, 0], scale: 1.35 },
  // Warm traditional area rug grounding the desk + chair workspace.
  { id: 'rug', type: 'AreaRug', position: [-1.13, 0, -1.45], rotation: [0, 0, 0] },
  // Fiddle-leaf fig in a woven basket — tucked into the front-left corner.
  { id: 'plant', type: 'PottedPlant', position: [-2.6, 0, 2.55], rotation: [0, 0, 0] },
  // Blank gallery set on the LEFT wall (whiteboard wall), centered between the whiteboard's
  // back edge (z=-0.65) and the back-left corner (z=-2.88); raised so it fully clears the desk.
  { id: 'gallery', type: 'GalleryWall', position: [-2.878, 2.12, -1.7], rotation: [0, Math.PI / 2, 0], scale: 1.7 },
]
