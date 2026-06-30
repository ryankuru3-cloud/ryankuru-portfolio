Integrate my finished ICON portfolio section into this website's Portfolio area.

SOURCE (in my project's icon-port/ folder):
- ICON_Section_Mockup_final.html — the section, built to match my existing DECA / About /
  Evolution mockups (Source Serif 4 + Inter, exact University of Arizona palette: navy
  #0C234B, cardinal #AB0520, accent #1E5288, sky #81D3EB).
- assets/deck-01.png … deck-07.png — the seven pitch-deck slides (16:9), in order.
- assets/jersey-lakers.png, jersey-knicks.png, jersey-celtics.png — the three product mockups.
- assets/nba-lab.jpg — the NBA Lab building photo.

Adapt everything to this site's actual stack and conventions, and wire it in the same way my
existing DECA section is integrated. Steps:

1. EXTRACT THE SECTION, NOT THE PAGE. Use only the markup from <div class="icon"> →
   <div class="icon-scroll"> through the end of the final <section class="band dark">
   ("Why it matters"). Ignore the mockup's <head> and the mockup-only page host at the top of
   its <style> (the `html, body { height:100% }` / `.icon { height:100vh }` block) — that was
   only so the file previews full-screen on its own. In the site, .icon should fill its
   container the way my DECA section does (height:100%).

2. ASSETS. Copy the seven deck slides, the three jersey images, and nba-lab.jpg into the site's
   static/assets dir, then:
   - In the deck viewer, REPLACE each <img class="deck-slide" src="data:image/png;base64,…">
     with src pointing at the copied deck-01…07.png (the base64 was only for offline preview).
   - Repoint the three jersey <img src> and the NBA Lab <img src> at the copied files.

3. NO EXTERNAL DEPENDENCY. Unlike my DECA section (which used Google <model-viewer>), ICON's
   centerpiece is a plain image carousel — there is nothing to install. The slide cycling is
   vanilla JS in the mockup's <script>; keep it as-is, or fold it into the site's framework,
   but add no new libraries.

4. PRESERVE THE DECK BEHAVIOR EXACTLY — it's deliberate: the slide viewer auto-advances every
   5s, crossfades between slides, and supports prev/next buttons, clickable dots, and
   ArrowLeft/ArrowRight; it pauses on hover and stops auto-advancing once the user interacts;
   and it only starts once the deck scrolls into view. Keep all of it.

5. NAMESPACE THE CSS. The mockup uses generic class names (.intro .stage .deck .jerseys .jcard
   .band .reveal .frame .shot .cap .kicker .lede .h-sec .btitle .bbody .pull .story .jnote
   .slabel …) that WILL collide with the rest of the site. Everything is already wrapped in a
   .icon container and scoped under it — keep that scoping, or port the rules into the site's
   CSS-module/scoped system under the same root. Reuse my existing UA color variables and fonts
   if already defined globally; otherwise pull the :root variables and the Google Fonts @import
   (Inter + Source Serif 4) from the mockup.

6. KEEP THE MOTION. The scroll animations live in the mockup's <script>: a reveal-on-scroll
   fade-and-rise (.reveal → .in via IntersectionObserver), staggered delays via the --d custom
   property, a scale-in on the media (.reveal.media — the deck, the jersey cards, the NBA Lab
   photo), and the red accent-line draw. If the site already has a scroll-reveal system, wire
   the section into that instead of adding a second observer; otherwise port the script and
   guard it to run once. Keep the prefers-reduced-motion fallback (everything shown, no movement).

7. DO NOT CHANGE THE COPY. The Context / Claims / Reasoning text (the intro paragraph, the deck
   "story" paragraph, the "What it proves" band, the "Why it matters" band), the deck slide
   captions, and the concept-mockup disclaimer ("Concept mockups of the idea applied to real
   moments. Not real or licensed products.") are finalized — keep them verbatim.

8. PLACE IT. Insert the section into the Portfolio area at the anchor my Portfolio nav expects,
   id="portfolio-icon", in my ICON slot — this replaces the old generic "Jersey Concept"
   project card, so it must open from the same room fixture and nav link that currently point
   there. Render it full-bleed and chromeless like my DECA and About sections (no inner card),
   and keep the links that target ICON elsewhere (my Bio and Evolution panels) pointing at this
   slot.

VERIFY when done: section renders in Portfolio and opens from the room + nav; the deck loads,
auto-advances on entry, and crossfades; prev/next, dots, and arrow keys work, hover pauses it,
and auto-advance stops after I interact; all three jerseys and the NBA Lab photo show with
their captions; the reveal animations fire and the jersey cards cascade in; the mobile
breakpoint still collapses the grids; the prefers-reduced-motion fallback works; and none of
the section's styles leak into — or get overridden by — the rest of the site.
