import { createServer } from 'node:http'
import { readFileSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const PORT = 5173
const DIST = new URL('./dist', import.meta.url).pathname

const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf-8')

createServer((req, res) => {
  let path = req.url.split('?')[0]
  let filePath = join(DIST, path === '/' ? 'index.html' : path)

  if (!existsSync(filePath)) {
    filePath = join(DIST, 'index.html')
  }

  try {
    const stat = statSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': stat.size })
    res.end(readFileSync(filePath))
  } catch {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(indexHtml)
  }
}).listen(PORT, '0.0.0.0', () => console.log(`Serving on http://0.0.0.0:${PORT}`))
