# Personal Persona — portfolio "dollhouse" lobby

An interactive 3D cutaway diorama of a professional home office that serves as the navigation
for a portfolio site. The room is the lobby; real content lives in near-full-screen reader
panels added in later passes. Built with Vite + React + React Three Fiber.

## Run
```
npm install
npm run dev        # http://localhost:5184
```

## Build & deploy (Netlify)
```
npm run build      # static site → dist/
```
Netlify: build command `npm run build`, publish directory `dist` (see `netlify.toml`).

## Structure
- `src/config/layout.ts` — single source of truth: `ROOM` / `WINDOW` / `CAMERA`, plus `ZONES` / `FIXTURES` / `AMBIANCE` (filled in later passes).
- `src/config/theme.ts` — color palette.
- `src/scene/` — `Canvas`, lighting, room shell.
- `src/objects/` — individual 3D objects (window now; furniture / props added one at a time).
- `src/ui/Overlay.tsx` — HTML layer for the future content readers.

## Build order
Assets are added one at a time, with review between each. Current pass: **room shell only**.

### How to add an object later
1. Create `src/objects/<Name>.tsx` (accepts `position` / `rotation`).
2. Register it in `src/scene/Fixtures.tsx` (`REGISTRY`) or `Ambiance.tsx`.
3. Add an entry to `FIXTURES` / `AMBIANCE` in `src/config/layout.ts` with its transform.
