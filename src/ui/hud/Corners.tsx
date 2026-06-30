/**
 * Sharp-HUD corner brackets — four small accent L's pinned to a panel's corners.
 * Drop inside any `relative` element. Decorative only (pointer-events:none).
 */
export default function Corners({ size = 'h-4 w-4' }: { size?: string }) {
  const b = `pointer-events-none absolute ${size} border-accent`
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <span className={`${b} left-0 top-0 border-l border-t`} />
      <span className={`${b} right-0 top-0 border-r border-t`} />
      <span className={`${b} bottom-0 left-0 border-b border-l`} />
      <span className={`${b} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}
