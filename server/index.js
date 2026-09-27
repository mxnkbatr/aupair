import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const DIST = path.join(__dirname, '../dist')

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false }))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Au Pair API → http://localhost:${PORT}`)
  if (fs.existsSync(DIST)) {
    console.log(`Au Pair Web → http://localhost:${PORT}`)
  }
}).on('error', (err) => {
  console.error('API listen error:', err.message)
  process.exit(1)
})
