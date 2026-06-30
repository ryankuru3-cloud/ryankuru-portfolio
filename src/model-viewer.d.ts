import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * JSX typing for the Google <model-viewer> web component (registered at runtime via
 * `import('@google/model-viewer')`). Lets us use the lowercase custom-element tag with its
 * kebab-case attributes in TSX. Attributes are loose (string | number | boolean) because
 * model-viewer reads most of them as presence/string attributes.
 */
type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string
  alt?: string
  poster?: string
  'camera-controls'?: boolean
  'disable-zoom'?: boolean
  'auto-rotate'?: boolean
  'auto-rotate-delay'?: string | number
  'rotation-per-second'?: string
  'touch-action'?: string
  'interaction-prompt'?: string
  'shadow-intensity'?: string | number
  'shadow-softness'?: string | number
  exposure?: string | number
  'environment-image'?: string
  'camera-orbit'?: string
  'min-camera-orbit'?: string
  'max-camera-orbit'?: string
  'field-of-view'?: string
  ar?: boolean
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}
