import { useEffect, useRef, type CSSProperties } from 'react'
import type { DecaContent } from '../../config/content'
import './DecaSection.css'

/**
 * DECA portfolio section — a faithful port of DECA_Section_Mockup.html (section markup only:
 * intro → trophy stage → photos → "What it proves" → "Why it matters"; the mockup's nav/footer
 * are dropped, the site has its own). Mounts in the Reader (SectionBody → Reader) as a fullBleed
 * + chromeless panel. Markup, copy, and captions are VERBATIM; styles live in the scoped
 * DecaSection.css (.deca). Asset paths come from content (model + the two photos).
 *
 * The drag-to-rotate trophy is Google <model-viewer>, registered once via a lazy dynamic import
 * (keeps it out of the main bundle until this panel opens). Its attributes are preserved exactly
 * from the mockup: camera-controls + disable-zoom + touch-action="pan-y" + auto-rotate +
 * auto-rotate-delay="0" + interaction-prompt="none", and NO `ar` — so it auto-spins on load,
 * drag rotates, and wheel/scroll passes straight through to the page.
 *
 * The mockup's <script> motions are ported into the effect below, scoped to this panel's own
 * scroll container and torn down on unmount: reveal-on-scroll fade (.reveal → .in), the red
 * accent-line draw (CSS, keyed off the same .in), and the stat count-up. The prefers-reduced-
 * motion fallback matches the original (everything shown, counters jump to final, no transitions).
 */

// inline CSS custom property `--d` (per-element reveal stagger), typed for TSX
const delay = (d: string) => ({ '--d': d }) as CSSProperties

export default function DecaSection({ content }: { content: DecaContent }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Register the <model-viewer> custom element lazily (only when this panel mounts).
  useEffect(() => {
    import('@google/model-viewer')
  }, [])

  // reveal + accent draw + stat count-up — ported 1:1 from the mockup, scoped to .deca-scroll
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const counted = new WeakSet<Element>()
    const rafs: number[] = []

    const countUp = (el: Element) => {
      if (counted.has(el)) return
      counted.add(el)
      const target = +(el.getAttribute('data-count') || '0')
      let t0: number | null = null
      const dur = 900
      const step = (ts: number) => {
        if (!t0) t0 = ts
        const p = Math.min((ts - t0) / dur, 1)
        const v = Math.round(p * target)
        if (el.firstChild) el.firstChild.nodeValue = String(v)
        if (p < 1) rafs.push(requestAnimationFrame(step))
      }
      if (el.firstChild) el.firstChild.nodeValue = '0'
      rafs.push(requestAnimationFrame(step))
    }

    if (reduce) {
      root.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'))
      root.querySelectorAll('.n[data-count]').forEach((n) => {
        if (n.firstChild) n.firstChild.nodeValue = n.getAttribute('data-count') || ''
      })
      return
    }

    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            e.target.classList.add('in')
            const c = e.target.querySelector('.n[data-count]')
            if (c) countUp(c)
            obs.unobserve(e.target)
          })
        },
        { root, threshold: 0.16 },
      )
      root.querySelectorAll('.reveal').forEach((n) => io?.observe(n))
    } else {
      root.querySelectorAll('.reveal').forEach((n) => {
        n.classList.add('in')
        const c = n.querySelector('.n[data-count]')
        if (c) countUp(c)
      })
    }

    return () => {
      io?.disconnect()
      rafs.forEach((r) => cancelAnimationFrame(r))
    }
  }, [])

  // reveal the placeholder if a photo fails to load (mirrors the mockup's inline onerror)
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    img.style.display = 'none'
    const ph = img.nextElementSibling as HTMLElement | null
    if (ph) ph.style.display = 'flex'
  }

  return (
    <div className="deca">
      <div className="deca-scroll" ref={scrollRef}>
        {/* INTRO (Context) */}
        <section className="intro" id="portfolio-deca">
          <div className="container">
            <div className="reveal"><span className="kicker"><span className="dot"></span>Arizona DECA · State Championship</span></div>
            <h2 className="h-sec reveal" style={delay('.06s')}>First Place — <span className="thin">Financial Services Team Decision Making</span></h2>
            <div className="reveal" style={delay('.12s')}><div className="paccent"></div></div>
            <p className="lede reveal" style={delay('.16s')}>Financial Services Team Decision Making is a DECA (student career organization) event in which a two-person team is given a client scenario in financial services, develops a recommendation under time pressure, and presents it to a judge. DECA reached me through my high-school marketing class, but our interest in financial services led <b>my partner and me</b> to enter the finance-focused competitions, rather than marketing. We competed at the state level and placed first.</p>
          </div>

          {/* TROPHY STAGE */}
          <div className="stage reveal" style={delay('.05s')}>
            <div className="stage-in">
              <p className="stage-tag"><span className="ln"></span>The trophy<span className="ln"></span></p>
              <div style={{ position: 'relative' }}>
                <model-viewer
                  src={content.model}
                  alt="First-place DECA Financial Services Team Decision Making trophy, shaped like the state of Arizona — Arizona state championship, 2023"
                  camera-controls
                  disable-zoom
                  touch-action="pan-y"
                  auto-rotate
                  auto-rotate-delay="0"
                  rotation-per-second="16deg"
                  interaction-prompt="none"
                  shadow-intensity="0.9"
                  shadow-softness="1"
                  exposure="1.05"
                  environment-image="neutral"
                  camera-orbit="8deg 82deg 105%"
                  min-camera-orbit="auto auto 72%"
                  max-camera-orbit="auto auto 150%"
                  field-of-view="30deg"
                ></model-viewer>
              </div>
            </div>

            {/* STAT STRIP */}
            <div className="stats">
              <div className="stat reveal"><div className="n" data-count="15">0<span className="u">min</span></div><div className="l">to read the case cold <b>&amp; build a plan</b></div></div>
              <div className="stat reveal" style={delay('.08s')}><div className="n" data-count="10">0<span className="u">min</span></div><div className="l">to present it <b>live to a judge</b></div></div>
              <div className="stat reveal" style={delay('.16s')}><div className="n">1<span className="u">st</span></div><div className="l">place · <b>State of Arizona</b></div></div>
              <div className="stat reveal" style={delay('.24s')}><div className="n">2023</div><div className="l">two-person <b>team event</b></div></div>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="shots">
          <div className="container">
            <div className="shots-grid">
              <figure className="frame reveal">
                <div className="win">
                  <img src={content.photoTrophy} alt="Ryan Kuru holding the first-place trophy with his partner at left, alongside two fellow competitors" onError={onImgError} />
                  <div className="ph" style={{ display: 'none' }}>
                    <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M3 17l5-4 4 3 3-2 6 5" /></svg>
                    <div className="pt">Image unavailable</div>
                    <div className="ps">My partner and I with the first-place trophy.</div>
                  </div>
                </div>
                <figcaption className="cap"><span className="num">01</span><span className="tx">My partner and I are on the left, with the trophy — the other two are fellow competitors.</span></figcaption>
              </figure>

              <figure className="frame reveal" style={delay('.1s')}>
                <div className="win">
                  <img src={content.photoStage} alt="Ryan Kuru and his partner recognized on stage at the Arizona DECA state championship" onError={onImgError} />
                  <div className="ph" style={{ display: 'none' }}>
                    <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M3 17l5-4 4 3 3-2 6 5" /></svg>
                    <div className="pt">Image unavailable</div>
                    <div className="ps">Recognized on stage at the state championship.</div>
                  </div>
                </div>
                <figcaption className="cap"><span className="num">02</span><span className="tx">Recognized on stage at the state championship.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* WHAT IT PROVES · CLAIMS */}
        <section className="band surface">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">What it proves</span>The format left no room to rehearse.</h3>
            <p className="bbody">Each team was given <span className="hl">15 minutes</span> to read a client case scenario cold and build a plan, then <span className="hl">10 minutes</span> to role-play it with a judge acting as our client. Placing first came down to a specific set of skills: reading an unfamiliar situation quickly, committing to a clear recommendation, communicating it convincingly under pressure, and executing as a team.</p>
          </div></div>
        </section>

        {/* WHY IT MATTERS · REASONING */}
        <section className="band dark">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">Why it matters</span>The same demands as a real client conversation.</h3>
            <p className="bbody">Understanding the situation, forming a recommendation, and holding someone's confidence while every word is weighed — that is the core of an advisor's job.</p>
            <p className="bbody pull">Choosing the financial event years before it was ever strategically useful is the honest version of why I'm pursuing this work: <span className="hl">the interest came first, and the result shows I can perform on it.</span></p>
          </div></div>
        </section>
      </div>
    </div>
  )
}
