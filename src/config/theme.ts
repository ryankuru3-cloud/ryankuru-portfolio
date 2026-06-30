/**
 * Warm-neutral, professional "cozy modern office" palette.
 * Solid matte colors (clean low-poly). Shell colors are used now; the rest are
 * referenced by furniture / props added in later passes.
 */
export const palette = {
  // Room shell — graphite charcoal: dark cool-grey walls so the white wall letters pop.
  floorWood: '#c9a574',
  floorWoodEdge: '#b8915f',
  wall: '#3b3c42',
  wallBack: '#35363d',
  baseboard: '#4a4b52',
  windowFrame: '#f6f3ec',
  glass: '#cfe1ee',
  sky: '#e6eff7',

  // Furniture / objects (later passes)
  deskTop: '#c69963',
  deskLeg: '#eae7e0',
  whiteboard: '#fcfcfb',
  boardFrameAlu: '#cdd1d6',
  cork: '#c69f68',
  boardFrameWood: '#977445',
  paper: '#f7f5ef',
  screenOff: '#1c2630',
  screenGlow: '#3b6e8c',
} as const
