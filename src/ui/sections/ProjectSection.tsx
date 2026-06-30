import type { ProjectContent } from '../../config/content'

/**
 * A portfolio project page: hero image + tagline, then the rubric's three labeled blocks
 * (Context / Claim / Reasoning), optional tag chips, and link buttons. Styled to match the
 * Video/Contact custom panels; the Reader centers it at a readable width.
 */
export default function ProjectSection({ content }: { content: ProjectContent }) {
  const blocks: [string, string][] = [
    ['Context', content.context],
    ['Claim', content.claim],
    ['Reasoning', content.reasoning],
  ]

  return (
    <div className="space-y-7">
      {/* hero — real image when supplied, otherwise a tasteful placeholder showing the tagline */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#27313d] via-[#1a222c] to-[#10151c]">
        {content.image && (
          <img
            src={content.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-x-4 bottom-3 text-sm font-medium text-white/90">
          {content.tagline}
        </div>
      </div>

      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {content.tags.map((t) => (
            <span
              key={t}
              className="border border-white/12 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {blocks.map(([label, body]) => (
          <div key={label}>
            <h4 className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{label}</h4>
            <p className="text-[15px] leading-relaxed text-slate-300">{body}</p>
          </div>
        ))}
      </div>

      {content.links && content.links.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {content.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="border border-accent/60 bg-accent/15 px-5 py-2.5 text-sm font-medium uppercase tracking-[0.12em] text-accent transition hover:bg-accent/25"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
