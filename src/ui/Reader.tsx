import { SECTIONS, AREAS } from '../config/content'
import { useReaderStore } from '../store/useReaderStore'
import { useViewStore } from '../store/useViewStore'
import { goToSection } from '../lib/useItemInteraction'
import SectionBody from './sections/SectionBody'
import Corners from './hud/Corners'

/**
 * Full-screen content reader: dimmed + blurred backdrop over the 3D scene, a centered
 * scrollable card. Opens when a section is active (User view only). The header carries
 * the sibling sections of the current area as tabs, so reading flows like pages.
 * Closed by ×, a backdrop click, or Esc (Esc handled centrally in ZoomControls).
 */
export default function Reader() {
  const sectionId = useReaderStore((s) => s.section)
  const close = useReaderStore((s) => s.close)
  const isUser = useViewStore((s) => s.mode) === 'user'

  if (!sectionId || !isUser) return null
  const section = SECTIONS[sectionId]
  if (!section) return null

  const area = AREAS.find((a) => a.zone === section.zone)
  const siblings = area ? area.sections : [sectionId]
  const isPdf = section.kind === 'pdf'
  // Full-bleed sections fill the card and own their scroll (PDFs via the pdf.js viewer, the
  // Professional Evolution + About/Bio panels via their own scroll container). Other custom
  // panels stay centered at a readable width. Only the PDF viewer wants the dark backing.
  const fullBleed = isPdf || section.kind === 'evolution' || section.kind === 'bio' || section.kind === 'deca' || section.kind === 'icon' || section.kind === 'gifted'
  // Chromeless sections drop the Reader's header bar so the content gets the full card.
  // The Evolution + About/Bio + DECA + ICON panels carry their own hero/title, so the bar is redundant.
  const chromeless = section.kind === 'evolution' || section.kind === 'bio' || section.kind === 'deca' || section.kind === 'icon' || section.kind === 'gifted'

  return (
    <div
      className="reader-backdrop pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-midnight/60 px-3 pb-3 pt-[78px] backdrop-blur-md sm:px-5 sm:pb-5 sm:pt-[82px]"
      onClick={close}
    >
      <div
        className="reader-panel relative flex h-full w-full max-w-[1600px] flex-col overflow-hidden border border-white/12 bg-arizona/85 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Corners />

        {/* Chromeless panels (Professional Evolution) skip the header bar entirely; a floating
            × keeps the panel closable (Esc + backdrop click also work). */}
        {chromeless && (
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center border border-white/15 bg-midnight/45 text-white/85 backdrop-blur transition hover:border-accent/60 hover:text-accent"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        )}

        {/* header — centered mono labels on a translucent bar */}
        {!chromeless && (
        <div className="relative shrink-0 border-b border-white/10 px-7 pb-4 pt-6 text-center sm:px-9">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-accent">{section.eyebrow}</p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{section.title}</h2>
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center border border-white/10 text-slate-400 transition hover:border-accent/60 hover:text-accent"
          >
            <span className="text-xl leading-none">✕</span>
          </button>

          {siblings.length > 1 && (
            <div className="mt-4 flex justify-center gap-1.5">
              {siblings.map((sid) => (
                <button
                  key={sid}
                  onClick={() => goToSection(sid)}
                  className={`border px-3.5 py-1 text-[12px] font-medium uppercase tracking-[0.12em] transition ${
                    sid === sectionId
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {SECTIONS[sid].title}
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        {/* body — full-bleed for PDFs (the iframe fills the card); custom panels stay
            centered at a readable width so they don't stretch across the near-fullscreen card. */}
        <div className={fullBleed ? `flex-1 overflow-hidden${isPdf ? ' bg-midnight' : ''}` : 'flex-1 overflow-y-auto'}>
          {fullBleed ? (
            <SectionBody id={sectionId} />
          ) : (
            <div className="mx-auto max-w-3xl px-7 py-8 sm:px-9">
              <SectionBody id={sectionId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
