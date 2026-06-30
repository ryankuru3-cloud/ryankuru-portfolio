import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type { GiftedContent } from '../../config/content'
import './GiftedSection.css'

/**
 * Gifted portfolio section — a self-contained custom panel in the same format as DecaSection /
 * IconSection (intro → dark "stage" centerpiece → "What it proves" → "Why it matters"). Mounts in
 * the Reader (SectionBody → Reader) as a fullBleed + chromeless panel, so it carries its own hero.
 * EVERY rule is scoped under `.gifted` in GiftedSection.css and uses the University of Arizona
 * palette shared with DECA/ICON (--navy #0C234B, --red #AB0520, Azurite/Sky), so the three Work
 * Portfolio pages read as one set.
 *
 * The centerpiece is the two DEMO ROOMS (Man Cave + Garage). Each room card is an <a> wired to the
 * matching entry in content.demos (index 0 = Man Cave, 1 = Garage). When that entry's `href` is a
 * real http(s) URL the card opens the demo in a new tab and shows a "Step inside" CTA; while it's a
 * placeholder ('#') the card renders as a styled "Demo coming soon" preview (click is a no-op). Drop
 * a screenshot path into the entry's `image` to use it as the card art (falls back to a themed icon).
 *
 * Motion is the same "simple" scroll reveal used across the site: an IntersectionObserver scoped to
 * this panel's own scroll container fades/rises `.reveal` elements in (with `--d` stagger) and draws
 * the red accent line. Honors prefers-reduced-motion (everything shown, no transitions).
 */

// inline CSS custom property `--d` (per-element reveal stagger), typed for TSX
const delay = (d: string) => ({ '--d': d }) as CSSProperties

// Demo-room copy (verbatim) — index-aligned with content.demos (the live link + optional image).
const DEMOS: { id: string; name: string; blurb: string; icon: ReactNode }[] = [
  {
    id: 'man-cave',
    name: 'The Man Cave',
    blurb: 'Gifts for the guy whose whole personality is game day.',
    icon: (
      // a big-screen TV with a couch in front of it
      <svg viewBox="0 0 96 64" fill="none" aria-hidden="true">
        <rect x="24" y="3" width="48" height="29" rx="3" fill="#0b1c3b" stroke="#81D3EB" strokeWidth="2.4" />
        <path d="M44 11l11 6.5-11 6.5z" fill="#81D3EB" />
        <rect x="44" y="32" width="8" height="4" fill="#5f7da8" />
        <rect x="35" y="36" width="26" height="3" rx="1.5" fill="#5f7da8" />
        <rect x="18" y="46" width="60" height="13" rx="3.5" fill="#81D3EB" />
        <rect x="18" y="39" width="11" height="16" rx="3.5" fill="#81D3EB" />
        <rect x="67" y="39" width="11" height="16" rx="3.5" fill="#81D3EB" />
        <rect x="30" y="41" width="36" height="9" rx="3" fill="#bfe6f3" />
      </svg>
    ),
  },
  {
    id: 'garage',
    name: 'The Garage',
    blurb: 'Tools, gear, and toys for the tinkerer.',
    icon: (
      // a car parked under a pitched garage roof / door
      <svg viewBox="0 0 96 64" fill="none" aria-hidden="true">
        <path d="M8 25 48 6l40 19" stroke="#81D3EB" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        <rect x="16" y="25" width="64" height="34" rx="2.5" fill="#0b1c3b" stroke="#81D3EB" strokeWidth="2.2" />
        <rect x="27" y="40" width="42" height="13" rx="4" fill="#81D3EB" />
        <path d="M34 40c1.5-5 4-7 8-7h6c4 0 6.5 2 8 7z" fill="#bfe6f3" />
        <circle cx="35" cy="53" r="4.5" fill="#dfeaf6" />
        <circle cx="61" cy="53" r="4.5" fill="#dfeaf6" />
        <rect x="28" y="45" width="5" height="3.5" rx="1.5" fill="#AB0520" />
        <rect x="63" y="45" width="5" height="3.5" rx="1.5" fill="#AB0520" />
      </svg>
    ),
  },
]

// A demo card is "live" when its href is a real destination — either an external http(s) URL or
// a same-origin path (e.g. /demos/man-cave/, where the rooms are bundled). '#' stays "coming soon".
const isLive = (href?: string) => !!href && href !== '#' && (/^https?:\/\//i.test(href) || href.startsWith('/'))

export default function GiftedSection({ content }: { content: GiftedContent }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // reveal-on-scroll (fade/rise + media scale-in) + red accent-line draw, scoped to .gifted-scroll
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (reduce || !('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          obs.unobserve(e.target)
        })
      },
      { root, threshold: 0.16 },
    )
    root.querySelectorAll('.reveal').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  // reveal the icon placeholder if a room screenshot fails to load (mirrors the DECA/ICON onerror)
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    img.style.display = 'none'
    const ph = img.nextElementSibling as HTMLElement | null
    if (ph) ph.style.display = 'flex'
  }

  return (
    <div className="gifted">
      <div className="gifted-scroll" ref={scrollRef}>

        {/* 1 · INTRO — what Gifted is, the launch, and the business model (the description) */}
        <section className="intro" id="portfolio-gifted">
          <div className="container">
            <div className="reveal"><span className="kicker"><span className="dot"></span>Self-Started Venture · Launching {content.launch}</span></div>
            <h2 className="h-sec reveal" style={delay('.06s')}>The right gift, <span className="thin">without the guesswork.</span></h2>
            <div className="reveal" style={delay('.12s')}><div className="paccent"></div></div>
            <p className="lede reveal" style={delay('.16s')}><span className="wm">Gifted</span> is a web app I'm designing and building to take the guesswork out of giving, with an intended launch in {content.launch}. Instead of scrolling endless product lists, you browse hand-curated themed rooms like a Man Cave or a Garage, each stocked with a tight, considered set of gifts for that kind of person. Find something that fits, click through, and buy it straight from the retailer.</p>
            <p className="lede sub reveal" style={delay('.22s')}>It's free to use. Gifted earns an affiliate commission on what sells, so the revenue comes from retail partners, not the people doing the gifting. It's built for everyday gift-givers, the busy, the stuck, and the last-minute, who'd rather land on something thoughtful in two minutes than lose an evening to a dozen open tabs.</p>
          </div>
        </section>

        {/* 2 · STAGE — the two demo rooms (clickable) */}
        <div className="stage">
          <div className="stage-in">
            <p className="stage-tag reveal"><span className="ln"></span>Step into a demo room<span className="ln"></span></p>

            <div className="rooms">
              {DEMOS.map((room, i) => {
                const link = content.demos[i] || { href: '#' }
                const live = isLive(link.href)
                return (
                  <a
                    key={room.id}
                    className={`room reveal media${live ? '' : ' soon'}`}
                    style={delay(i === 0 ? '.04s' : '.12s')}
                    href={live ? link.href : '#'}
                    {...(live
                      ? { target: '_blank', rel: 'noreferrer' }
                      : { onClick: (e: React.MouseEvent) => e.preventDefault(), 'aria-disabled': true })}
                  >
                    <div className="room-art">
                      {link.image && (
                        <img src={link.image} alt={`Preview of the ${room.name} demo room`} onError={onImgError} />
                      )}
                      <div className="room-ph" style={link.image ? { display: 'none' } : undefined}>
                        <span className="room-ico">{room.icon}</span>
                      </div>
                      <span className="room-badge">{live ? 'Open the demo' : 'Demo coming soon'}</span>
                    </div>
                    <div className="room-body">
                      <h3 className="room-name">{room.name}</h3>
                      <p className="room-blurb">{room.blurb}</p>
                      <span className="room-cta">{live ? 'Step inside' : 'Preview soon'} <span className="arw">→</span></span>
                    </div>
                  </a>
                )
              })}
            </div>

            <p className="rooms-note reveal" style={delay('.2s')}>Two sample rooms from the concept. The full app launches {content.launch}.</p>

            {isLive(content.siteUrl) && (
              <div className="cta-wrap reveal" style={delay('.26s')}>
                <a className="site-cta" href={content.siteUrl} target="_blank" rel="noreferrer">Visit the live site <span className="arw">→</span></a>
              </div>
            )}
          </div>
        </div>

        {/* 3 · WHAT IT PROVES — Claim */}
        <section className="band surface">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">What it proves</span>Gifted is more than just a business. It's a tool for my growth.</h3>
            <p className="bbody">I'm taking on the whole venture with AI, from designing and building the 3D assets and environments, to planning and running the marketing campaign behind it. My goal with this endeavor is to build a comprehensive understanding of the capabilities of AI and how to implement them practically.</p>
          </div></div>
        </section>

        {/* 4 · WHY IT MATTERS — Reasoning */}
        <section className="band dark">
          <div className="container"><div className="reading reveal">
            <h3 className="btitle"><span className="lab">Why it matters</span>In financial fields, the people who pull ahead will be the ones who stay aware of and leverage the tools available, constantly adopting new and efficient practices.</h3>
            <p className="bbody">Running Gifted, from creating 3D environments to in-depth marketing strategies for promotion, has helped me build the habits necessary to succeed in this <span className="hl">uniquely AI-focused environment.</span></p>
          </div></div>
        </section>

      </div>
    </div>
  )
}
