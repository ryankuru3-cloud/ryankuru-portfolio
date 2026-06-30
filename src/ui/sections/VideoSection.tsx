import type { VideoContent } from '../../config/content'

export default function VideoSection({ content }: { content: VideoContent }) {
  return (
    <div className="space-y-6">
      {/* poster placeholder — swap for a real <video> later */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#27313d] via-[#1a222c] to-[#10151c]">
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            aria-label="Play"
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/80 bg-midnight/45 shadow-[0_0_26px_rgba(171,5,32,0.5)] backdrop-blur transition hover:bg-accent/15"
          >
            <span className="ml-1 block h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-accent" />
          </button>
        </div>
        <div className="absolute bottom-3 left-4 text-sm font-semibold text-white/90">{content.title}</div>
        <div className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
          {content.length}
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-300">{content.summary}</p>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Chapters</h4>
        <ul className="space-y-1.5">
          {content.transcript.map((line, i) => (
            <li key={i} className="text-sm text-slate-400">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
