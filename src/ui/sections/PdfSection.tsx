import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import type { PdfContent } from '../../config/content'

/**
 * Styled document viewer. Renders the PDF at `content.pdf` with pdf.js into clean white
 * pages (soft drop-shadows on a neutral background) in a continuous vertical scroll —
 * no browser PDF chrome. A slim custom toolbar shows the live page count + Open/Download.
 * Swap the file at the same public/pdfs/ path to change content; no code change.
 *
 * Each mount gets its own PDFWorker (Vite bundles it as a module worker) and tears it
 * down on unmount, so React StrictMode's double-mount can't destroy a shared worker.
 */
export default function PdfSection({ content, title }: { content: PdfContent; title?: string }) {
  const { pdf } = content
  const scrollRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [current, setCurrent] = useState(1)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!pdf) {
      setStatus('error')
      return
    }
    let cancelled = false
    const container = pagesRef.current
    if (container) container.innerHTML = ''
    setStatus('loading')
    setNumPages(0)
    setCurrent(1)

    const worker = new pdfjsLib.PDFWorker({ port: new PdfjsWorker() as unknown as Worker })
    const task = pdfjsLib.getDocument({ url: pdf, worker })

    ;(async () => {
      try {
        const doc = await task.promise
        if (cancelled) return
        setNumPages(doc.numPages)
        const outputScale = Math.min(window.devicePixelRatio || 1, 2)

        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p)
          if (cancelled) return
          const viewport = page.getViewport({ scale: 1.4 })
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          canvas.width = Math.floor(viewport.width * outputScale)
          canvas.height = Math.floor(viewport.height * outputScale)
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
          canvas.style.display = 'block'

          const wrap = document.createElement('div')
          wrap.dataset.page = String(p)
          wrap.style.cssText =
            `margin:0 auto 26px;width:100%;max-width:${Math.floor(viewport.width)}px;` +
            'overflow:hidden;background:#fff;' +
            'box-shadow:0 14px 44px rgba(0,0,0,0.55);outline:1px solid rgba(255,255,255,0.16);outline-offset:-1px;'
          wrap.appendChild(canvas)
          container?.appendChild(wrap)

          const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
          await page.render({ canvasContext: ctx, viewport, transform }).promise
          if (cancelled) return
        }
        if (!cancelled) setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          console.error('[PdfSection] failed to render', pdf, err)
          setStatus('error')
        }
      }
    })()

    return () => {
      cancelled = true
      task.destroy().catch(() => {})
      try {
        worker.destroy()
      } catch {
        /* noop */
      }
    }
  }, [pdf])

  // keep the page counter in sync with scroll position
  const onScroll = () => {
    const sc = scrollRef.current
    const pages = pagesRef.current
    if (!sc || !pages) return
    const mid = sc.scrollTop + sc.clientHeight / 2
    let cur = 1
    for (const child of Array.from(pages.children) as HTMLElement[]) {
      if (child.offsetTop <= mid) cur = Number(child.dataset.page) || cur
    }
    setCurrent(cur)
  }

  if (!pdf) {
    return (
      <div className="hud-grid flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl">📄</div>
        <p className="max-w-sm text-sm text-slate-400">
          No PDF yet. Drop your file in{' '}
          <code className="border border-white/10 px-1.5 py-0.5 font-mono text-slate-300">public/pdfs/</code> and point
          this section at it in <code className="border border-white/10 px-1.5 py-0.5 font-mono text-slate-300">content.ts</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="hud-grid relative flex h-full flex-col">
      {/* slim toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-arizona/85 px-5 py-2.5 backdrop-blur-xl">
        <span className="font-mono text-xs uppercase tracking-wider tabular-nums text-slate-400">
          {status === 'ready' ? `Page ${current} / ${numPages}` : status === 'loading' ? 'Loading…' : 'Could not load PDF'}
        </span>
        <a
          href={pdf}
          target="_blank"
          rel="noreferrer"
          className="border border-white/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-slate-300 transition hover:border-accent/60 hover:text-accent"
        >
          Open ↗
        </a>
      </div>

      {/* scrollable pages */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-7 sm:px-8">
        <div ref={pagesRef} aria-label={title ? `${title} (PDF)` : 'Document'} />
        {status === 'loading' && <div className="py-10 text-center font-mono text-xs uppercase tracking-wider text-slate-500">Rendering document…</div>}
        {status === 'error' && (
          <div className="py-10 text-center font-mono text-xs uppercase tracking-wider text-slate-500">Could not load PDF — drop a valid file in public/pdfs/</div>
        )}
      </div>

      {/* large download button — floats over the pages, bottom-right */}
      <a
        href={pdf}
        download="Ryan_Kuru_Resume.pdf"
        className="absolute bottom-6 right-6 z-10 flex items-center gap-2.5 border border-accent/60 bg-accent/15 px-5 py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-accent shadow-[0_0_26px_rgba(171,5,32,0.5)] backdrop-blur transition hover:bg-accent/25"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Download
      </a>
    </div>
  )
}
