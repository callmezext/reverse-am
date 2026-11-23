const express = require('express')
const path = require('path')
const apiRoutes = require('./app/api/route')

const app = express()
const PORT = Number(process.env.PORT) || 3301

const rateLimit = require('express-rate-limit')

// Percayakan reverse proxy Cloudflare agar IP asli client terbaca
app.set('trust proxy', 1)

app.use(require('cors')())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiter ketat khusus endpoint sensitif (send-link & verify-link)
// Maksimal 15 request per 5 menit per IP (mencegah spam / brute-force Firebase)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.'
  }
})

// Rate limiter umum untuk semua endpoint /api/ (status, stats, dll)
// Maksimal 120 request per menit per IP
const globalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit terlampaui. Santai dulu sejenak.'
  }
})

app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    }
  }
}))

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'))
})

app.use('/api', globalApiLimiter, apiRoutes(authLimiter))

app.listen(PORT, () => {
  console.log(`server jalan di http://localhost:${PORT}`)
})
