/**
 * Site content model — the SINGLE place to edit what the readers + nav show.
 *
 * Each of the room's clickable items maps to one SectionDef here. The full-screen
 * reader (`src/ui/Reader.tsx`) renders a section by switching on its `kind`, and the
 * top navbar (`src/ui/TopNav.tsx`) is built from `AREAS` (with each section's `icon` +
 * `navDesc` shown in the dropdown mega-menus).
 *
 * Document sections (Biography, Résumé, Portfolio, Evolution) are `kind: 'pdf'` — the
 * reader renders the file at `content.pdf` with pdf.js (styled page viewer). To put in
 * your OWN content, drop your PDF at the same path under `public/pdfs/` (no code change).
 * Contact + "Who I Am" stay interactive custom panels (a form/mailto and a video player).
 *
 * Name + email intentionally match the 3D nameplate / laptop in the scene ("Ryan Kuru",
 * arizona.edu) so the room and the panels read as one piece.
 */

export type SectionKind = 'pdf' | 'video' | 'contact' | 'project' | 'evolution' | 'bio' | 'deca' | 'icon' | 'gifted'

// ---- per-kind content shapes -------------------------------------------------
export type ContactLink = { label: string; handle: string; href: string }
export type ProjectLink = { label: string; href: string }

export type PdfContent = { pdf: string }
export type VideoContent = { title: string; length: string; summary: string; transcript: string[] }
export type ContactContent = { blurb: string; links: ContactLink[] }
// A portfolio project — hero image + the rubric's Context / Claim / Reasoning, plus links.
export type ProjectContent = {
  image?: string
  tagline: string
  context: string
  claim: string
  reasoning: string
  tags?: string[]
  links?: ProjectLink[]
}

// Professional Evolution — a self-contained custom panel (ProfessionalEvolution.tsx).
// The copy/charts live in the component; this just carries the live link targets:
// the LinkedIn URL and which Work-Portfolio section each in-panel #portfolio link opens.
export type EvolutionContent = {
  linkedinUrl: string
  portfolio: { icon: string; gifted: string; deca: string; explore: string }
}

// About / Bio — a self-contained custom panel (AboutBio.tsx), a 1:1 port of the approved
// About_Bio_Section_Mockup.html. The copy lives in the component; this just carries the live
// link targets: the LinkedIn URL and which Work-Portfolio section each in-panel link opens
// (Gifted → Gifted, ICON → Jersey, "explore"/"View portfolio" → the portfolio). Lead Sweep
// is intentionally unlinked. Email is kept here for completeness/consistency with the panel.
export type BioContent = {
  linkedinUrl: string
  email: string
  portfolio: { gifted: string; icon: string; explore: string }
}

// DECA portfolio section — a self-contained custom panel (DecaSection.tsx), a faithful port of
// the approved DECA_Section_Mockup.html. Copy + captions live in the component; this carries the
// static asset paths (the Draco trophy GLB + the two photos under public/).
export type DecaContent = {
  model: string
  photoTrophy: string
  photoStage: string
}

// ICON portfolio section — a self-contained custom panel (IconSection.tsx), a faithful port of
// icon-port/ICON_Section_Mockup_final.html. Copy + captions live in the component; this carries
// the static asset paths (the 7 pitch-deck slides in order, the 3 jersey mockups, the NBA Lab photo).
export type IconContent = {
  deck: string[]
  jerseys: { lakers: string; knicks: string; celtics: string }
  nbaLab: string
}

// Gifted portfolio section — a self-contained custom panel (GiftedSection.tsx) built in the same
// ICON/DECA format (intro → demo-room "stage" → "What it proves" → "Why it matters"). The copy
// lives in the component; this carries only the data that changes: the intended launch date, an
// optional live site URL (shown once it ships), and the two demo-room links. Each demo entry is
// index-aligned with the DEMOS array in GiftedSection.tsx (0 = Man Cave, 1 = Garage): drop a real
// URL into `href` to make a room open in a new tab, and an optional `image` to use a screenshot as
// its card art.
export type GiftedDemoLink = { href: string; image?: string }
export type GiftedContent = {
  launch: string
  siteUrl?: string
  demos: GiftedDemoLink[]
}

export type SectionContent = PdfContent | VideoContent | ContactContent | ProjectContent | EvolutionContent | BioContent | DecaContent | IconContent | GiftedContent

export type SectionDef = {
  id: string
  zone: string // which room zone the camera dollies to (matches ZONES in layout.ts)
  eyebrow: string // small kicker above the title in the reader header
  title: string
  kind: SectionKind
  navDesc?: string // short description shown under the title in the navbar dropdown
  icon?: string // icon key for the navbar dropdown (see ICONS in TopNav.tsx)
  content: SectionContent
}

// Shared identity — kept consistent with the 3D nameplate + laptop in the scene.
export const PERSONA = {
  name: 'Ryan Kuru',
  role: 'Creative Developer · 3D & Interactive Web',
  // One-line value prop shown on the intro screen — edit to your real pitch.
  tagline: 'Designing and building interactive, data-driven experiences for the web.',
  email: 'ryankuru@arizona.edu',
  location: 'Tucson, Arizona',
  // Intro / enter-screen copy (rendered by IntroOverlay.tsx). Option A masthead.
  intro: {
    eyebrow: 'Wealth Management Candidate · University of Arizona',
    subhead:
      'Welcome to my website — an interactive portfolio I designed and developed with coding and AI tools. The three areas with content — About Me, my Work Portfolio, and my Professional Evolution.',
    cta: 'Step inside',
    helper: 'Take a look around — start wherever you like',
  },
} as const

// ---- nav structure: 3 areas, each revealing its sub-sections -----------------
export type AreaDef = { zone: string; label: string; sections: string[] }

// Labels mirror the big 3D wall labels in the room (see LABELS in config/layout.ts).
export const AREAS: AreaDef[] = [
  { zone: 'desk', label: 'About Me', sections: ['bio', 'video', 'contact', 'resume'] },
  { zone: 'bulletin', label: 'Work Portfolio', sections: ['jersey', 'gift', 'trophy'] },
  { zone: 'whiteboard', label: 'Professional Evolution', sections: ['evolution'] },
]

// ---- the sections ------------------------------------------------------------
export const SECTIONS: Record<string, SectionDef> = {
  // --- About (desk) ---
  bio: {
    id: 'bio',
    zone: 'desk',
    eyebrow: 'About',
    title: 'Biography',
    kind: 'bio',
    navDesc: 'Who I am and how I work',
    icon: 'user',
    content: {
      linkedinUrl: 'https://www.linkedin.com/in/ryankuru/',
      email: 'ryankuru@arizona.edu',
      // ICON → Jersey Concept, Gifted → Gifted; "View portfolio"/"(Full breakdowns…)" open the
      // Work Portfolio (first panel) — same mapping as the Professional Evolution panel.
      portfolio: { gifted: 'gift', icon: 'jersey', explore: 'jersey' },
    } satisfies BioContent,
  },

  video: {
    id: 'video',
    zone: 'desk',
    eyebrow: 'About',
    title: 'Who I Am',
    kind: 'video',
    navDesc: 'A short intro video',
    icon: 'play',
    content: {
      title: 'My Professional Journey',
      length: '2:36',
      summary:
        'A short intro — who I am, how a low-poly modeling hobby turned into building real-time rooms for the web, and the kind of problems I like to chew on.',
      transcript: [
        "00:00 — Hey, I'm Ryan. Welcome to the office.",
        '00:18 — How a Blender hobby quietly became a career direction.',
        "01:05 — The projects I'm proudest of, and what I learned the hard way.",
        '01:52 — Where I want to take this next.',
      ],
    } satisfies VideoContent,
  },

  contact: {
    id: 'contact',
    zone: 'desk',
    eyebrow: 'About',
    title: 'Contact',
    kind: 'contact',
    navDesc: 'Email, phone & LinkedIn',
    icon: 'mail',
    content: {
      blurb: "Open to internships, projects, and collaborations — the best ways to reach me are below.",
      links: [
        { label: 'Email', handle: 'ryankuru3@gmail.com', href: 'mailto:ryankuru3@gmail.com' },
        { label: 'LinkedIn', handle: 'in/ryankuru', href: 'https://www.linkedin.com/in/ryankuru/' },
        { label: 'Phone', handle: '480-410-8576', href: 'tel:+14804108576' },
      ],
    } satisfies ContactContent,
  },

  // --- Résumé (on the desk reading stand → part of the About Me / desk area) ---
  resume: {
    id: 'resume',
    zone: 'desk',
    eyebrow: 'Career',
    title: 'Résumé',
    kind: 'pdf',
    navDesc: 'Experience, skills & education',
    icon: 'file',
    content: { pdf: '/pdfs/resume.pdf?v=3' } satisfies PdfContent,
  },

  // --- Work Portfolio (bulletin) ---
  // ICON — self-started sports-apparel venture (the "icon" target the Bio + Professional Evolution
  // panels link to; anchor id="portfolio-icon"). Rich custom panel: pitch-deck carousel + mockups.
  // Keeps the section id 'jersey' so the room's jersey exhibit + existing nav links still open it.
  jersey: {
    id: 'jersey',
    zone: 'bulletin',
    eyebrow: 'Portfolio · Venture',
    title: 'ICON Project',
    kind: 'icon',
    navDesc: 'Self-started sports-apparel venture',
    icon: 'shirt',
    content: {
      deck: [
        '/icon/deck-01.png',
        '/icon/deck-02.png',
        '/icon/deck-03.png',
        '/icon/deck-04.png',
        '/icon/deck-05.png',
        '/icon/deck-06.png',
        '/icon/deck-07.png',
      ],
      jerseys: {
        lakers: '/icon/jersey-lakers.png',
        knicks: '/icon/jersey-knicks.png',
        celtics: '/icon/jersey-celtics.png',
      },
      nbaLab: '/icon/nba-lab.jpg',
    } satisfies IconContent,
  },

  gift: {
    id: 'gift',
    zone: 'bulletin',
    eyebrow: 'Portfolio · Venture',
    title: 'Gifted',
    kind: 'gifted',
    navDesc: "A gifting web app I'm designing and building",
    icon: 'gift',
    content: {
      launch: 'September 2026',
      // Set this once the app is live; an empty string hides the "Visit the live site" button.
      siteUrl: '',
      // index 0 = Man Cave, index 1 = Garage (see DEMOS in GiftedSection.tsx). The demo rooms are
      // bundled into this site's public/demos/, so they open same-origin in a new tab. Add `image`
      // to use a screenshot as the card art.
      demos: [
        { href: '/demos/man-cave/' },
        { href: '/demos/garage/' },
      ],
    } satisfies GiftedContent,
  },

  // DECA — First-Place Financial Services Team Decision Making (the "deca" target the Bio +
  // Professional Evolution panels link to). Rich custom panel: drag-to-rotate trophy + photos.
  trophy: {
    id: 'trophy',
    zone: 'bulletin',
    eyebrow: 'Portfolio · Award',
    title: 'Financial Service Trophy',
    kind: 'deca',
    navDesc: 'First place — Arizona DECA state championship',
    icon: 'trophy',
    content: {
      model: '/models/trophy_opt.glb',
      photoTrophy: '/images/deca-trophy.jpg',
      photoStage: '/images/deca-stage.jpg',
    } satisfies DecaContent,
  },

  // --- Evolution (whiteboard) ---
  evolution: {
    id: 'evolution',
    zone: 'whiteboard',
    eyebrow: 'Evolution',
    title: 'Professional Evolution',
    kind: 'evolution',
    navDesc: 'How I see myself vs. how others do',
    icon: 'route',
    content: {
      linkedinUrl: 'https://www.linkedin.com/in/ryankuru/',
      // Per Ryan: ICON → Jersey Concept, Gifted → Gifted, DECA → Competition Trophy;
      // the generic "Explore the Portfolio" button opens the Work Portfolio (first panel).
      portfolio: { icon: 'jersey', gifted: 'gift', deca: 'trophy', explore: 'jersey' },
    } satisfies EvolutionContent,
  },
}
