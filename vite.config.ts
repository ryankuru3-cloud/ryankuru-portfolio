import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Dev parity with production: the bundled demo rooms (public/demos/<room>/) are independent
 * static SPAs. Serve their index.html for a /demos/<room>/ request so Vite's single-page-app
 * fallback doesn't rewrite it to the portfolio's index.html (which sends visitors back to the
 * entrance). Their assets are already served straight from public/. Dev-only; in production the
 * netlify.toml /demos/* passthrough serves these statically.
 */
function demoRoomsDevServer(): Plugin {
  return {
    name: 'demo-rooms-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        const m = path.match(/^\/demos\/([^/]+)\/?$/)
        if (!m) return next()
        try {
          const html = readFileSync(resolve(import.meta.dirname, 'public/demos', m[1], 'index.html'), 'utf-8')
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
        } catch {
          next()
        }
      })
    },
  }
}

/**
 * Dev-only middleware for the placement editor (Edit view): it POSTs the whole slots map
 * here and we pretty-write it to src/config/placements.json. Vite HMR re-merges the file into
 * the store so saves go live in every open tab without a reload.
 */
function placementsWriter(): Plugin {
  return {
    name: 'placements-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__placements', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}')
            writeFileSync(resolve(import.meta.dirname, 'src/config/placements.json'), JSON.stringify(data, null, 2) + '\n', 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), placementsWriter(), demoRoomsDevServer()],
  server: { host: true, port: 5184, strictPort: true },
  base: './',
  // Force single instances — avoids "Multiple instances of Three.js" / duplicate React
  // (which break the R3F reconciler) once app code imports three/react directly.
  resolve: { dedupe: ['three', 'react', 'react-dom', '@react-three/fiber'] },
})
