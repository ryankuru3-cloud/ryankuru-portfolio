import { useEffect, useRef, type MouseEvent } from 'react'
import type { BioContent } from '../../config/content'
import { useNavConfirmStore } from '../../store/useNavConfirmStore'
import './AboutBio.css'

/**
 * About / Bio — a 1:1 port of About_Bio_Section_Mockup.html into a React panel that mounts in
 * the Reader (see SectionBody → Reader). Markup, copy, and colors are unchanged from the
 * approved mockup; styles live in the scoped AboutBio.css (.about-root). The mockup's top <nav>
 * is dropped in favor of the site's global TopNav; its footer is kept (the app has no global
 * footer). A slim dot-nav carries the scroll-spy.
 *
 * The mockup's three animations are ported into the effect below, scoped to this component's own
 * scroll container and torn down on unmount: (a) fade + rise on each block as it enters view,
 * (b) the red heading underline drawing 0 → full (CSS, triggered by the same `.in` class), and
 * (c) scroll-spy that lights the dot for the section currently in view. The prefers-reduced-motion
 * fallback matches the original (everything shown, no transitions).
 *
 * Placeholder links are wired to the live site: in-panel portfolio links open their Work-Portfolio
 * panel via goToSection (Gifted → Gifted, ICON → Jersey, "(Full breakdowns…)"/"View portfolio" →
 * portfolio). Lead Sweep is intentionally left UNLINKED. Email + LinkedIn are real.
 */
export default function AboutBio({ content }: { content: BioContent }) {
  const rootRef = useRef<HTMLDivElement>(null) // .about-root — holds the pinned dot-nav
  const scrollRef = useRef<HTMLDivElement>(null) // .about-scroll — the only scrolling element
  const pf = content.portfolio
  const requestNav = useNavConfirmStore((s) => s.request)

  // Area-jump links ask for confirmation first (NavConfirm) before opening that Work-Portfolio
  // panel — guards against an accidental click flinging the visitor to the wrong area.
  const openSection = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    requestNav(id)
  }

  // Dot-nav: smooth-scroll the internal container to a section (honors reduced motion).
  const scrollToId = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = scrollRef.current?.querySelector('#' + id)
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  useEffect(() => {
    const root = scrollRef.current
    const container = rootRef.current
    if (!root || !container) return

    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    // (a)+(b) fade/rise reveal + underline draw (both keyed off `.in`)
    if (reduce || !('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'))
    }

    let io: IntersectionObserver | null = null
    let spy: IntersectionObserver | null = null

    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              obs.unobserve(e.target)
            }
          })
        },
        { root, threshold: 0.12 },
      )
      root.querySelectorAll('.reveal').forEach((n) => io?.observe(n))

      // (c) scroll-spy: light the dot for the section currently in view
      const dots = Array.from(container.querySelectorAll<HTMLElement>('.dotnav a'))
      const ids = ['top', 'p01', 'p02', 'p03', 'contact']
      spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            const i = ids.indexOf((e.target as HTMLElement).id)
            dots.forEach((d, di) => d.classList.toggle('active', di === i))
          })
        },
        { root, rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      )
      ids.forEach((id) => {
        const s = root.querySelector('#' + id)
        if (s) spy?.observe(s)
      })
    }

    return () => {
      io?.disconnect()
      spy?.disconnect()
    }
  }, [])

  return (
    <div className="about-root" ref={rootRef}>
      {/* dot-nav (scroll-spy) — replaces the mockup's top nav; global TopNav handles site nav */}
      <nav className="dotnav" aria-hidden="true">
        <a href="#top" className="active" onClick={scrollToId('top')}><span>About</span></a>
        <a href="#p01" onClick={scrollToId('p01')}><span>Who I Am</span></a>
        <a href="#p02" onClick={scrollToId('p02')}><span>Proving My Claims</span></a>
        <a href="#p03" onClick={scrollToId('p03')}><span>Where I'm Going</span></a>
        <a href="#contact" onClick={scrollToId('contact')}><span>Contact</span></a>
      </nav>

      <div className="about-scroll" ref={scrollRef}>
        {/* HERO */}
        <header className="hero" id="top">
          <div className="hero-in">
            <img className="photo" src="/images/ryan-headshot.jpg" alt="Ryan Kuru, in a navy suit and red tie by a lake" />
            <div>
              <p className="eyebrow">About</p>
              <h1>Ryan Kuru</h1>
              <p className="role">Aspiring wealth management professional · University of Arizona</p>
              <div className="cta">
                <a className="btn primary" href={content.linkedinUrl} target="_blank" rel="noreferrer">Connect on LinkedIn</a>
                <a className="btn ghost" href="#portfolio" onClick={openSection(pf.explore)}>View portfolio</a>
              </div>
            </div>
          </div>
        </header>

        {/* INFO CARD */}
        <div className="cardwrap">
          <div className="card reveal">
            <div className="card-grid">
              <div className="col">
                <div className="clabel">Education</div>
                <span className="csch">University of Arizona — Eller College of Management</span>
                <div className="cdeg"><b>Majors</b> · Business Economics &amp; New Venture Development</div>
                <div className="cdeg"><b>Minors</b> · Personal &amp; Family Financial Planning + Nutritional Sciences</div>
              </div>
              <div className="col">
                <div className="clabel">Current ventures</div>
                <ul className="cproj">
                  <li><button type="button" className="lnk" onClick={openSection(pf.gifted)}>Gifted</button> — interactive 3D affiliate-marketing site I designed and built</li>
                  <li><button type="button" className="lnk" onClick={openSection(pf.icon)}>ICON</button> — sports-apparel brand, currently securing collegiate licensing rights</li>
                  <li><b>Lead Sweep</b> — appointment-brokerage I built and run for local home services</li>
                </ul>
              </div>
              <div className="col contact">
                <div className="clabel">Contact</div>
                <a href="mailto:ryankuru@arizona.edu">ryankuru@arizona.edu</a>
                <a href={content.linkedinUrl} target="_blank" rel="noreferrer">linkedin.com/in/ryankuru</a>
              </div>
            </div>
          </div>
        </div>

        {/* PART I */}
        <section className="band" id="p01">
          <div className="container"><div className="reading reveal">
            <div className="pnum">01</div><h2 className="ptitle">Who I Am</h2><div className="paccent"></div>
            <div className="sub"><p className="slabel">My Standard</p><p className="body">I've started to hold myself to the highest standard, and I go all in on whatever I take on. I'd rather understand something deeply and do it right than do it halfway — and if I get stuck or puzzled, rather than stay there, I educate myself until I satisfy my definition of success.</p></div>
            <div className="sub"><p className="slabel">Self-Education</p><p className="body">When something catches my interest or a project needs a skill I don't have, I learn it instead of waiting for a class or future lesson to cover it. I'd go so far as to say I value self-education more than my formal degree.</p></div>
            <div className="sub"><p className="slabel">AI in Practice</p><p className="body">A lot of that self-education now runs through AI, which I treat as the most important tool to master — especially in this hyper-competitive environment. I use it across real work: building websites, creating marketing content and strategies, and developing interactive 3D environments. I don't use it as a shortcut, but as an unparalleled tool for self-improvement and expert execution.</p></div>
          </div></div>
        </section>

        {/* PART II */}
        <section className="band alt" id="p02">
          <div className="container"><div className="reading reveal">
            <div className="pnum">02</div><h2 className="ptitle">Proving My Claims</h2><div className="paccent"></div>
            <div className="sub"><p className="slabel">What I've Built</p><p className="body">I'd rather show the work than just describe it. While still in school, I've taught myself to build and run real ventures across completely different industries — <a href="#portfolio" onClick={openSection(pf.gifted)}>Gifted</a>, a 3D affiliate-marketing site I coded front to back around a real economic model; <a href="#portfolio" onClick={openSection(pf.icon)}>ICON</a>, a sports-apparel brand where I'm currently pursuing collegiate licensing rights; and Lead Sweep, an appointment-brokerage I operate end to end. Same pattern every time: I think of a new opportunity, learn what's needed, build it properly, and follow through. <a href="#portfolio" onClick={openSection(pf.explore)}>(Full breakdowns in my portfolio.)</a></p></div>
            <div className="sub"><p className="slabel">Trust &amp; People</p><p className="body">Drive only matters if people can trust you with it. Before any of these projects, I spent two years as a personal trainer — a one-on-one advisor keeping people disciplined toward long-term goals. My peers and teammates can back that up: in peer reviews I was rated the top contributor on my team, with effort and quality scores well above average, and the note that comes up most is that I'm direct and follow through. I'd rather tell someone the truth than what's easy to hear.</p></div>
          </div></div>
        </section>

        {/* PART III */}
        <section className="band dark" id="p03">
          <div className="container"><div className="reading reveal">
            <div className="pnum">03</div><h2 className="ptitle">Where I'm Going</h2><div className="paccent"></div>
            <div className="sub"><p className="body">What draws me to wealth management is the type of culture and work ethic that come with it. Between working with people while building rapport, and a genuine interest in finance, choosing to pursue it was an easy decision. I want to build real relationships and continue to learn as much as possible in this high-finance field.</p></div>
          </div></div>
        </section>

        {/* FOOTER */}
        <footer className="footer" id="contact">
          <div className="foot-in">
            <div className="foot-name">Ryan Kuru</div>
            <div className="foot-links">
              <a href="mailto:ryankuru@arizona.edu">ryankuru@arizona.edu</a>
              <a href={content.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="#portfolio" onClick={openSection(pf.explore)}>Portfolio</a>
            </div>
            <div className="foot-copy">© 2026 Ryan Kuru · University of Arizona, Eller College of Management</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
