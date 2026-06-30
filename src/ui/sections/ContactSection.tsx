import type { ContactContent } from '../../config/content'

export default function ContactSection({ content }: { content: ContactContent }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <p className="text-[15px] leading-relaxed text-slate-300">{content.blurb}</p>

      <div className="space-y-2.5">
        {content.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="flex items-center justify-between border border-white/10 px-4 py-3 transition hover:border-accent/50 hover:bg-white/5"
          >
            <span className="text-sm font-medium text-slate-100">{l.label}</span>
            <span className="font-mono text-sm text-slate-400">{l.handle}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
