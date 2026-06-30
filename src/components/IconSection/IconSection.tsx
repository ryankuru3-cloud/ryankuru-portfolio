import { useEffect, useRef, type CSSProperties } from 'react'
import type { IconContent } from '../../config/content'
import './IconSection.css'

/**
 * ICON portfolio section — a faithful port of icon-port/ICON_Section_Mockup_final.html
 * (section markup only: intro → deck+story stage → "What it proves" → "Why it matters"; the
 * mockup's page-host block is dropped so `.icon` fills the Reader card like DecaSection).
 * Mounts in the Reader (SectionBody → Reader) as a fullBleed + chromeless panel. Markup, copy,
 * captions, and the disclaimer are VERBATIM; styles live in the scoped IconSection.css (.icon).
 * Asset paths come from content (the 7 deck slides, the 3 jerseys, the NBA Lab photo).
 *
 * The mockup's <script> is ported 1:1 into the effect below, scoped to this panel's own scroll
 * container (#iconScroll) and torn down on unmount: (a) reveal-on-scroll fade/rise + media
 * scale-in + red accent-line draw (IntersectionObserver → .in; CSS does the rest), and (b) the
 * image-only deck carousel — auto-advances every 5s, crossfades, prev/next + clickable dots +
 * ArrowLeft/Right, pauses on hover, STOPS auto-advancing once the user interacts, and only
 * starts once the deck scrolls into view. No libraries. prefers-reduced-motion fallback matches
 * the original (everything shown, no movement, no auto-advance).
 */

// inline CSS custom property `--d` (per-element reveal stagger), typed for TSX
const delay = (d: string) => ({ '--d': d }) as CSSProperties

// deck slide copy (verbatim) — index-aligned with content.deck (the 7 slide image paths)
const DECK = [
  { cap: "Title slide. ICON turns basketball's greatest moments into wearable art.", alt: 'ICON pitch deck slide 1, title' },
  { cap: 'The market. Jerseys have become identity, collectibles, and everyday wear.', alt: 'ICON pitch deck slide 2, the market' },
  { cap: 'The problem. Every team runs the same formula, and the biggest fans are underserved.', alt: 'ICON pitch deck slide 3, the problem' },
  { cap: "The solution. One highlight, rendered as stencil art on the player's own jersey.", alt: 'ICON pitch deck slide 4, the solution' },
  { cap: 'The product line. Five edition types, from single moments to legacy and awards.', alt: 'ICON pitch deck slide 5, the product line' },
  { cap: 'The opportunity. A billion-dollar market that spikes around the moments.', alt: 'ICON pitch deck slide 6, the opportunity' },
  { cap: 'The close. Moments, immortalized.', alt: 'ICON pitch deck slide 7, the close' },
]

export default function IconSection({ content }: { content: IconContent }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    // ---- reveal-on-scroll (fade/rise + media scale-in + accent draw) ----
    let io: IntersectionObserver | null = null
    if (reduce || !('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'))
    } else {
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              obs.unobserve(e.target)
            }
          })
        },
        { root, threshold: 0.16 },
      )
      root.querySelectorAll('.reveal').forEach((n) => io!.observe(n))
    }

    // ---- deck carousel ----
    const slides = Array.from(root.querySelectorAll<HTMLImageElement>('.deck-slide'))
    const idxEl = root.querySelector('#deckIdx')
    const capNum = root.querySelector('#deckCapNum')
    const capTx = root.querySelector('#deckCapTx')
    const dotsWrap = root.querySelector('#deckDots')
    const frame = root.querySelector('#deckFrame')
    const prevBtn = root.querySelector('#deckPrev')
    const nextBtn = root.querySelector('#deckNext')
    let cur = 0
    let timer: number | null = null
    let userTouched = false
    let dots: Element[] = []
    const pad2 = (n: number) => (n < 10 ? '0' : '') + n

    const show = (i: number) => {
      cur = (i + slides.length) % slides.length
      slides.forEach((s, k) => s.classList.toggle('on', k === cur))
      dots.forEach((d, k) => d.classList.toggle('on', k === cur))
      if (idxEl) idxEl.textContent = pad2(cur + 1)
      if (capNum) capNum.textContent = pad2(cur + 1)
      if (capTx) capTx.textContent = slides[cur]?.getAttribute('data-cap') || ''
    }
    const next = () => show(cur + 1)
    const prev = () => show(cur - 1)
    const stop = () => {
      userTouched = true
      if (timer) { clearInterval(timer); timer = null }
    }
    const start = () => {
      if (!reduce && !userTouched && !timer) timer = window.setInterval(next, 5000)
    }

    // build dots (clear first so a StrictMode double-invoke doesn't duplicate them)
    if (dotsWrap) {
      dotsWrap.innerHTML = ''
      slides.forEach((_, i) => {
        const b = document.createElement('button')
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1))
        if (i === 0) b.className = 'on'
        b.addEventListener('click', () => { stop(); show(i) })
        dotsWrap.appendChild(b)
      })
      dots = Array.from(dotsWrap.children)
    }

    const onNext = () => { stop(); next() }
    const onPrev = () => { stop(); prev() }
    const onEnter = () => { if (timer) { clearInterval(timer); timer = null } }
    const onLeave = () => { start() }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { stop(); next() }
      else if (e.key === 'ArrowLeft') { stop(); prev() }
    }
    nextBtn?.addEventListener('click', onNext)
    prevBtn?.addEventListener('click', onPrev)
    frame?.addEventListener('mouseenter', onEnter)
    frame?.addEventListener('mouseleave', onLeave)
    document.addEventListener('keydown', onKey)

    let io2: IntersectionObserver | null = null
    if ('IntersectionObserver' in window && frame) {
      io2 = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) start() }),
        { root, threshold: 0.4 },
      )
      io2.observe(frame)
    } else {
      start()
    }

    return () => {
      io?.disconnect()
      io2?.disconnect()
      if (timer) clearInterval(timer)
      nextBtn?.removeEventListener('click', onNext)
      prevBtn?.removeEventListener('click', onPrev)
      frame?.removeEventListener('mouseenter', onEnter)
      frame?.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('keydown', onKey)
      if (dotsWrap) dotsWrap.innerHTML = ''
    }
  }, [])

  // reveal the placeholder if the NBA Lab photo fails to load (mirrors the mockup's inline onerror)
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    img.style.display = 'none'
    const ph = img.nextElementSibling as HTMLElement | null
    if (ph) ph.style.display = 'flex'
  }

  const jerseyAlt = {
    lakers: 'ICON concept mockup on a gold Lakers jersey, number 77',
    knicks: 'ICON concept mockup on a New York jersey, number 11',
    celtics: 'ICON concept mockup on a Celtics jersey, number 0',
  }

  return (
    <div className="icon">
      <div className="icon-scroll" id="iconScroll" ref={scrollRef}>

        {/* 1 · INTRO — what ICON is + where it stands */}
        <section className="intro" id="portfolio-icon">
          <div className="container">
            <div className="reveal"><span className="kicker"><span className="dot"></span>Self-Started Venture · In Development</span></div>
            <h2 className="h-sec reveal" style={delay('.06s')}>The moment, not just the jersey.</h2>
            <div className="reveal" style={delay('.12s')}><div className="paccent"></div></div>
            <p className="lede reveal" style={delay('.16s')}>ICON is a sports apparel venture I've developed on my own. Here's the idea. You take one unforgettable highlight, like a buzzer-beater or a series-clinching dunk, and turn it into a stencil. That stencil goes on a copy of the jersey the player wore, finished with the date and the arena where it happened. It isn't a generic jersey, and it isn't a framed photo. It's the moment itself, made wearable. <span className="wm">ICON</span> is still a work in progress, and right now I'm focused on securing the collegiate licensing rights to bring the first pieces to market.</p>

            <div className="jerseys">
              <figure className="jcard reveal media" style={delay('0s')}><div className="win"><img src={content.jerseys.lakers} alt={jerseyAlt.lakers} /></div></figure>
              <figure className="jcard reveal media" style={delay('.09s')}><div className="win"><img src={content.jerseys.knicks} alt={jerseyAlt.knicks} /></div></figure>
              <figure className="jcard reveal media" style={delay('.18s')}><div className="win"><img src={content.jerseys.celtics} alt={jerseyAlt.celtics} /></div></figure>
            </div>
            <p className="jnote reveal" style={delay('.26s')}>Concept mockups of the idea applied to real moments. Not real or licensed products.</p>
          </div>
        </section>

        {/* 2 · THE DECK + THE STORY */}
        <div className="stage">
          <div className="stage-in">
            <p className="stage-tag reveal"><span className="ln"></span>The first pitch deck, and the story behind it<span className="ln"></span></p>

            <div className="deck reveal media" style={delay('.05s')}>
              <div className="deck-frame" id="deckFrame">
                {content.deck.map((src, i) => (
                  <img
                    key={i}
                    className={i === 0 ? 'deck-slide on' : 'deck-slide'}
                    src={src}
                    data-cap={DECK[i].cap}
                    alt={DECK[i].alt}
                  />
                ))}
                <button className="deck-nav prev" id="deckPrev" aria-label="Previous slide">&#8249;</button>
                <button className="deck-nav next" id="deckNext" aria-label="Next slide">&#8250;</button>
                <div className="deck-count"><span id="deckIdx">01</span> / 07</div>
              </div>
              <div className="deck-cap"><span className="num" id="deckCapNum">01</span><span className="tx" id="deckCapTx">{DECK[0].cap}</span></div>
              <div className="deck-dots" id="deckDots"></div>
              <p className="deck-hint">Click through all seven slides. Arrow keys work, too.</p>
            </div>

            <p className="story reveal" style={delay('.12s')}>Before I had a single contact or any permission, I did the market and licensing research myself and built this pitch deck from scratch. Then I flew to Connecticut on my own, during the school year, to present it in person to an NBA licensing group called NBA Lab. They told me it wasn't possible to break into the market at the NBA level. That's what pushed me toward my current path, the NCAA. The 2021 NIL rules opened up a realistic path at the college level, so I redirected ICON toward the University of Arizona. Earning that first meeting took two months of unanswered emails and a lot of showing up in person. Securing those collegiate rights and licensing contracts is where ICON stands today.</p>

            <figure className="frame shot reveal media" style={delay('.14s')}>
              <div className="win">
                <img src={content.nbaLab} alt="NBA Lab in Connecticut, where Ryan Kuru pitched ICON in person" onError={onImgError} />
                <div className="ph" style={{ display: 'none' }}>
                  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M3 17l5-4 4 3 3-2 6 5" /></svg>
                  <div className="pt">Photo goes here</div>
                  <div className="ps">The NBA Lab building in Connecticut. Drop your photo in and it replaces this panel.</div>
                </div>
              </div>
              <figcaption className="cap"><span className="num">02</span><span className="tx">NBA Lab in Connecticut, where I pitched it in person.</span></figcaption>
            </figure>
          </div>
        </div>

        {/* 3 · WHAT IT PROVES */}
        <section className="band surface">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">What it proves</span>What I do when no one hands me a plan.</h3>
            <p className="bbody">When I see a potential opportunity to work on and grow from, I act on it instead of leaving it on paper or as an idea in my head. When the NBA route closed, I found another way forward rather than stopping. If the idea turns out to have the same barriers at the league level, I will exhaust every route I can find until I get a foothold and start at a smaller level.</p>
          </div></div>
        </section>

        {/* 4 · WHY IT MATTERS */}
        <section className="band dark">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">Why it matters</span>The same drive, on your team.</h3>
            <p className="bbody">My assessments describe me as driven and self-starting, and ICON is where that actually shows up. I've researched it, built it, flown out to pitch it, and kept going when the first answer was no. Hand me a problem without a clear path, and this is how I work. I learn what's needed, do the work, and keep pushing until it moves.</p>
            <p className="bbody pull">This project has reinforced something I already believed: nothing in the world can take the place of persistence.</p>
          </div></div>
        </section>

      </div>
    </div>
  )
}
