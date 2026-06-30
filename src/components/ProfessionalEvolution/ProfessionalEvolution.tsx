import { useEffect, useRef, type MouseEvent } from 'react'
import type { EvolutionContent } from '../../config/content'
import { useNavConfirmStore } from '../../store/useNavConfirmStore'
import './ProfessionalEvolution.css'

/**
 * Professional Evolution — a 1:1 port of professional-evolution-section.html into a React
 * panel that mounts in the Reader (see SectionBody → Reader). Markup, copy, numbers, charts,
 * and colors are unchanged; styles live in the scoped ProfessionalEvolution.css (.pe-root).
 *
 * The reference's inline <script> (scroll-progress bar, IntersectionObserver scroll-reveal,
 * count-up numbers, bar-fill grow, active dot-nav) is ported into the effect below, scoped to
 * this component's own scroll container and torn down on unmount. The prefers-reduced-motion
 * fallback matches the original exactly.
 *
 * Placeholder links are wired to the live site: each #portfolio link opens its Work-Portfolio
 * panel via goToSection (ICON→Jersey, Gifted→Gifted, DECA→Trophy, "Explore"→portfolio), and
 * the dot-nav scrolls within the panel.
 */
export default function ProfessionalEvolution({ content }: { content: EvolutionContent }) {
  const rootRef = useRef<HTMLDivElement>(null) // .pe-root — holds the pinned chrome
  const scrollRef = useRef<HTMLDivElement>(null) // .pe-scroll — the only scrolling element
  const progRef = useRef<HTMLSpanElement>(null)
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
    const prog = progRef.current
    if (!root || !container) return

    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const rafs: number[] = []
    const timers: number[] = []

    // top scroll-progress bar (relative to the scroll container, not the window)
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight
      if (prog) prog.style.width = (max > 0 ? (root.scrollTop / max) * 100 : 0) + '%'
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // count-up (numbers default to their real value in the JSX, so they show even with no JS)
    const countUp = (el: Element) => {
      const target = parseFloat(el.getAttribute('data-count') || '0')
      const dec = parseInt(el.getAttribute('data-decimals') || '0', 10)
      if (reduce) {
        el.textContent = target.toFixed(dec)
        return
      }
      const dur = 1300
      let start: number | null = null
      const step = (ts: number) => {
        if (!start) start = ts
        const p = Math.min(1, (ts - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = (target * eased).toFixed(dec)
        if (p < 1) rafs.push(requestAnimationFrame(step))
        else el.textContent = target.toFixed(dec)
      }
      rafs.push(requestAnimationFrame(step))
    }

    // bars start empty (CSS width:0); grow to their value on reveal, staggered left-to-right
    const growBars = (scope: Element) => {
      scope.querySelectorAll('.bar__fill').forEach((f, i) => {
        const w = (f.getAttribute('data-w') || '0') + '%'
        if (reduce) {
          ;(f as HTMLElement).style.width = w
          return
        }
        timers.push(window.setTimeout(() => ((f as HTMLElement).style.width = w), 150 + i * 170))
      })
    }

    // JS is running → start counters at 0 so they visibly count up on reveal
    root.querySelectorAll('[data-count]').forEach((el) => {
      const dec = parseInt(el.getAttribute('data-decimals') || '0', 10)
      el.textContent = (0).toFixed(dec)
    })

    const reveal = (el: Element) => {
      el.classList.add('in')
      growBars(el)
      el.querySelectorAll('[data-count]').forEach(countUp)
    }

    let io: IntersectionObserver | null = null
    let navObs: IntersectionObserver | null = null

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            reveal(e.target)
            io?.unobserve(e.target)
          })
        },
        { root, threshold: 0.1, rootMargin: '0px 0px -18% 0px' },
      )
      root.querySelectorAll('.reveal').forEach((el) => io?.observe(el))

      const dots = Array.from(container.querySelectorAll('.dotnav a'))
      const ids = ['top', 'f01', 'f02', 'f03', 'close']
      navObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const i = ids.indexOf((e.target as HTMLElement).id)
              dots.forEach((d, di) => d.classList.toggle('active', di === i))
            }
          })
        },
        { root, threshold: 0.5 },
      )
      ids.forEach((id) => {
        const s = root.querySelector('#' + id)
        if (s) navObs?.observe(s)
      })
    } else {
      root.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('in')
        el.querySelectorAll('[data-count]').forEach(countUp)
      })
    }

    return () => {
      root.removeEventListener('scroll', onScroll)
      io?.disconnect()
      navObs?.disconnect()
      rafs.forEach((r) => cancelAnimationFrame(r))
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const pf = content.portfolio

  return (
    <div className="pe-root" ref={rootRef}>
      <div className="progress">
        <span className="progress__fill" ref={progRef} />
      </div>

      <nav className="dotnav" aria-hidden="true">
        <a href="#top" className="active" onClick={scrollToId('top')}><span>Top</span></a>
        <a href="#f01" onClick={scrollToId('f01')}><span>Core Values</span></a>
        <a href="#f02" onClick={scrollToId('f02')}><span>Communication</span></a>
        <a href="#f03" onClick={scrollToId('f03')}><span>Growth</span></a>
        <a href="#close" onClick={scrollToId('close')}><span>Close</span></a>
      </nav>

      <div className="pe-scroll" ref={scrollRef}>
        {/* HERO */}
        <section className="hero" id="top">
          <div className="wrap">
            <p className="eyebrow">Professional Evolution</p>
            <h1>How I see myself,<br />and how others do.</h1>
            <p className="lede">In wealth management, it comes down to an important question: can a client trust you with their money and their relationship? Rather than just a baseless claim that I'm trustworthy, I've pulled real assessment data, comparing how I see myself and how other people perceive me — people who know me and have worked with me. Three things held up across all of it: I'm driven with the ability to hold myself accountable, I'm direct and honest while adapting to whoever I'm with, and I stay composed and sharp when the stakes are highest.</p>
            <div className="name"><b>Ryan Kuru</b> · University of Arizona · Wealth Management</div>
          </div>
        </section>

        {/* FINDING 01 — CORE VALUES */}
        <section className="finding" id="f01">
          <div className="finding__num">01</div>
          <div className="wrap">
            <div className="finding__head reveal">
              <p className="eyebrow">Core Values</p>
              <p className="claim">What really drives me is wanting to be the best version of myself, in all aspects of life. Since I know what I'm capable of, I raise the bar for myself higher than anyone else would. I put immense value on my self education and the things that will help set me apart. <em>That drive is exactly why the people around me can confidently put their full trust in my services.</em></p>
            </div>

            <p className="sectionlabel reveal">The Evidence</p>

            {/* CHART */}
            <div className="card chartcard reveal">
              <h3>What motivates me — my own assessment</h3>
              <p className="sub">Top motivators, SPI self-assessment (scored out of 100)</p>
              <div className="bars">
                <div className="bar__row">
                  <span className="bar__label">Helping others</span>
                  <span className="bar__track"><span className="bar__fill" data-w="98" /></span>
                  <span className="bar__val"><span data-count="98" data-decimals="0">98</span></span>
                </div>
                <div className="bar__row">
                  <span className="bar__label">Stability</span>
                  <span className="bar__track"><span className="bar__fill" data-w="97" /></span>
                  <span className="bar__val"><span data-count="97" data-decimals="0">97</span></span>
                </div>
                <div className="bar__row">
                  <span className="bar__label">Drive to compete</span>
                  <span className="bar__track"><span className="bar__fill" data-w="95" /></span>
                  <span className="bar__val"><span data-count="95" data-decimals="0">95</span></span>
                </div>
              </div>
              <div className="bar__axis"><span>0</span><span>50</span><span>100</span></div>
            </div>

            {/* TWO BLOCKS */}
            <div className="evgrid">
              <div className="card block reveal d1">
                <span className="tag">The drive is real</span>
                <h4>Not self-reported.</h4>
                <p className="line">I rate my drive to compete a 95 — and my teammates put numbers on it independently:</p>
                <div className="stats">
                  <div><div className="stat__num"><span data-count="95" data-decimals="0">95</span>%</div><div className="stat__lab">effort, peer-rated</div></div>
                  <div><div className="stat__num"><span data-count="93.75" data-decimals="2">93.75</span>%</div><div className="stat__lab">quality of work</div></div>
                  <div><div className="stat__num"><span data-count="75" data-decimals="0">75</span>%</div><div className="stat__lab">ranked me #1 contributor</div></div>
                </div>
                <p className="quote">"Put in the most effort out of all of us."</p>
                <p className="line" style={{ marginTop: 18 }}>Shown in real work:</p>
                <div className="chips">
                  <button type="button" className="proj" onClick={openSection(pf.icon)}>ICON <span className="ar">&#8599;</span></button>
                  <button type="button" className="proj" onClick={openSection(pf.gifted)}>Gifted <span className="ar">&#8599;</span></button>
                </div>
                <p className="line tiny">Gifted — teaching myself AI by building it.</p>
              </div>

              <div className="card block reveal d2">
                <span className="tag">Why that drive earns trust</span>
                <h4>Pointed the right way.</h4>
                <p className="line"><b>Helping others — 98.</b> My single highest motivator. The drive is aimed at people, not just a scoreboard.</p>
                <p className="line"><b>Stability — 97.</b> I move fast, not reckless.</p>
                <p className="line" style={{ marginTop: 18 }}>Shown in real work:</p>
                <div className="chips">
                  <span className="chip">2 yrs personal training</span>
                  <button type="button" className="proj" onClick={openSection(pf.deca)}>DECA <span className="ar">&#8599;</span></button>
                </div>
                <p className="line tiny">DECA — a financial-services roleplay I won.</p>
              </div>
            </div>

            {/* LOUD PORTFOLIO CROSS-REFERENCE */}
            <div className="pfband reveal">
              <div className="pfband__t">
                <span className="k">See the proof</span>
                <p><b>These aren't ideas on paper.</b> ICON, Gifted, and DECA are real — each one gets a full breakdown, the story and the results, in my portfolio.</p>
              </div>
              <button type="button" className="btn" onClick={openSection(pf.explore)}>Explore the Portfolio <span>&#8594;</span></button>
            </div>

            {/* REASONING */}
            <div className="reasoning reveal">
              <p className="sectionlabel">The Reasoning</p>
              <p>The reason all that drive turns into trust is that I'm the one holding myself to it — no one else. In life, I firmly believe the most important relationship I have is the one with myself — it comes down to how I see myself, and whether I can say I'm proud of who I am. So the people I work with never have to wonder whether I'll show up or cut corners. And it isn't only how I see myself: <span className="hl">the people I've worked with describe the same drive.</span></p>
            </div>
          </div>
        </section>

        {/* FINDING 02 — COMMUNICATION STYLE */}
        <section className="finding" id="f02">
          <div className="finding__num">02</div>
          <div className="wrap">
            <div className="finding__head reveal">
              <p className="eyebrow">Communication Style</p>
              <p className="claim">Being <em>direct and honest</em> is the core of how I communicate, but I've never believed in a one-size-fits-all delivery. My ability to read the room well and adjust how I get my message across to whoever's in front of me is my <em>differentiating factor</em> in staying credible and having people actually be receptive to any message.</p>
            </div>

            <p className="sectionlabel reveal">The Evidence</p>

            <div className="card scattercard reveal">
              <h3>How I read my own style vs. how I'm experienced</h3>
              <p className="sub">Social-styles read — Proactivity (assertiveness) across, Reactivity (warmth) up</p>
              <svg className="scatter" viewBox="0 0 480 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Social-styles chart: self-view sits on the Driver/Expressive line; reputation sits in the Expressive quadrant.">
                <rect x="240" y="38" width="162" height="162" fill="#AB0520" opacity="0.10" />
                <rect x="78" y="38" width="324" height="324" fill="none" stroke="#E2E9EB" />
                <line x1="240" y1="38" x2="240" y2="362" stroke="#D8DEE6" />
                <line x1="78" y1="200" x2="402" y2="200" stroke="#D8DEE6" />
                <text x="396" y="54" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#AB0520">Expressive</text>
                <text x="396" y="354" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="600" fill="#8A99A8">Driver</text>
                <text x="84" y="54" textAnchor="start" fontFamily="Inter,sans-serif" fontSize="12" fill="#8A99A8">Amiable</text>
                <text x="84" y="354" textAnchor="start" fontFamily="Inter,sans-serif" fontSize="12" fill="#8A99A8">Analytical</text>
                <text x="240" y="386" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="#8A99A8">Proactivity &#8594;</text>
                <text x="22" y="200" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="#8A99A8" transform="rotate(-90 22 200)">Reactivity &#8594;</text>
                <defs><marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#AB0520" /></marker></defs>
                <line x1="298" y1="198" x2="319" y2="185" stroke="#AB0520" strokeWidth="1.8" strokeDasharray="3 3" markerEnd="url(#ah)" />
                <circle cx="294" cy="200" r="8" fill="#fff" stroke="#0C234B" strokeWidth="2.5" />
                <circle cx="323" cy="182" r="8.5" fill="#AB0520" />
              </svg>
              <div className="scatter-legend">
                <span><i className="dot dot--self" />How I see myself</span>
                <span><i className="dot dot--rep" />How others see me</span>
              </div>
              <p className="scatter-cap">I place myself right on the <b>Driver/Expressive line</b> — direct, results-first. The people who reviewed me land me squarely in <b>Expressive</b>: more assertive, and warmer than I rate myself.</p>
            </div>

            <div className="evgrid">
              <div className="card block reveal d1">
                <span className="tag">How I see myself</span>
                <h4>Direct &amp; results-first.</h4>
                <p className="line">My self-assessment reads <b>Driver/Expressive</b> — and my single highest working value is <b>relationships</b>.</p>
                <div className="adjwrap">
                  <span className="adj md">Driven</span>
                  <span className="adj md">Problem-Solver</span>
                  <span className="adj md">Even-Tempered</span>
                  <span className="adj sm">Idea-Generator</span>
                </div>
              </div>
              <div className="card block reveal d2">
                <span className="tag">How it lands</span>
                <h4>Confident, warm, engaging.</h4>
                <p className="line">The people I've worked with read me as <b>Expressive</b>, not blunt. The words they reach for most:</p>
                <div className="adjwrap">
                  <span className="adj lg">Self-Confident</span>
                  <span className="adj lg">Social</span>
                  <span className="adj lg">Easygoing</span>
                  <span className="adj lg">Spontaneous</span>
                  <span className="adj md">Calm</span>
                  <span className="adj md">Outgoing</span>
                  <span className="adj sm">Entertaining</span>
                  <span className="adj sm">Even-Tempered</span>
                  <span className="adj sm">Independent</span>
                </div>
              </div>
            </div>

            <div className="reasoning reveal">
              <p className="sectionlabel">The Reasoning</p>
              <p>Although I consider myself an extremely direct communicator, my messages don't come across as harsh or blunt, not because I hide facts, but because of my ability to shape the flow of a conversation. I tend to pick up on how someone needs to hear something, especially in a professional environment, and it shapes the way I decide to deliver my message. Being blunt tends to miss the target when it's a one-size-fits-all. However, when that tailored adjustment happens in the conversation, that same honest message comes off as confident and avoids friction. It's why the people I've worked with don't call me blunt, but instead they describe me as <span className="hl">self-confident, easygoing, and social</span>, even though I lead with directness. For an employer, that's the whole point: I'll give a client the truth, and deliver it in a way that keeps them comfortable and on board.</p>
            </div>
          </div>
        </section>

        {/* FINDING 03 — COMPOSURE UNDER PRESSURE */}
        <section className="finding" id="f03">
          <div className="finding__num">03</div>
          <div className="wrap">
            <div className="finding__head reveal">
              <p className="eyebrow">Composure Under Pressure</p>
              <p className="claim">I have the ability to perform when the pressure is on and the stakes are high. My tendency to <em>stay calm and level-headed</em> in stressful environments is what allows me to break through the noise and stand out. On top of that, I love the test — those moments help show me what I'm truly capable of, and where I'm able to learn and grow the most. Instead of shying away from the situations that make others nervous, <em>I look for them</em>.</p>
            </div>

            <p className="sectionlabel reveal">The Evidence</p>

            <div className="card convergecard reveal">
              <h3>The calm isn't self-reported — my reputation says the same</h3>
              <div className="converge">
                <div className="converge__side">
                  <span className="converge__lab">How I describe myself</span>
                  <div className="adjwrap"><span className="adj lg">Even-Tempered</span></div>
                </div>
                <div className="converge__mid" aria-hidden="true">
                  <span className="converge__arrow">&#8596;</span>
                  <span className="converge__note">same word</span>
                </div>
                <div className="converge__side">
                  <span className="converge__lab">How others describe me</span>
                  <div className="adjwrap">
                    <span className="adj md">Calm</span>
                    <span className="adj lg">Even-Tempered</span>
                    <span className="adj md">Poised</span>
                    <span className="adj md">Self-Confident</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card block reveal" style={{ marginTop: 26 }}>
              <span className="tag">Why I lean into it</span>
              <h4>The drive behind seeking pressure out.</h4>
              <p className="line">Composure is only half of it — the same data shows why I run toward high-stakes moments instead of away from them:</p>
              <div className="adjwrap">
                <span className="adj lg">Driven</span>
                <span className="adj md">Growth-Oriented</span>
                <span className="adj md">Risk-Taker</span>
                <span className="adj sm">Experimental</span>
              </div>
            </div>

            <div className="reasoning reveal">
              <p className="sectionlabel">The Reasoning</p>
              <p>Staying calm in high-pressure moments isn't a trait I have to force — it's a tendency that I consistently rely on and how I've learned to operate. It means a lot that the people I've worked with <span className="hl">describe me the same way I see myself</span>. However, what I care about even more is what these situations bring out. High-stakes situations show me what I'm truly capable of, and also where I have room to grow and the aspects I can improve. My appreciation for these moments gives me the urge to seek them out rather than avoid them. In a field like wealth management, where decisions are made under real pressure, this level-headed tendency of mine becomes a major asset.</p>
            </div>
          </div>
        </section>

        {/* CONCLUSION STUB / CLOSER */}
        <section className="closing" id="close">
          <div className="wrap">
            <p className="eyebrow">In closing</p>
            <p className="closing-lead">When the data is put together, one message becomes clear: I'm someone you can trust with clients and count on when the stakes are high. I'm driven and able to hold myself accountable. Honesty keeps my messaging clear, while my adaptability eases any friction. On top of that, I have the ability to stay steady under pressure. I would love to bring these assets into a wealth-management environment, while I continue to grow and learn, with the end goal of becoming an advisor a client doesn't just hire, but keeps around for the long run.</p>
            <a className="btn closing-btn" href={content.linkedinUrl} target="_blank" rel="noreferrer">Connect on LinkedIn &#8594;</a>
          </div>
        </section>

        <footer>Ryan Kuru — Professional Evolution</footer>
      </div>
    </div>
  )
}
