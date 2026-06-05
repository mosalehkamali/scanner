import { spawn } from 'child_process'
import { createConnection } from 'net'
import { writeFileSync } from 'fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222
const URL = 'http://localhost:3001/login'
const OUT = 'C:\\Users\\saleh\\Desktop\\login-screenshot.png'

// Start Chrome with remote debugging
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=1280,900',
  '--hide-scrollbars',
], { stdio: 'ignore' })

// Wait for Chrome to start
await new Promise(r => setTimeout(r, 2000))

// Fetch the debugger websocket URL
// Create new tab via PUT
const res = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(URL)}`, { method: 'PUT' })
const tab = await res.json()
const wsUrl = tab.webSocketDebuggerUrl

// Connect via WebSocket
const ws = new (await import('ws')).default(wsUrl)
await new Promise(r => ws.once('open', r))

let msgId = 1
const send = (method, params = {}) => new Promise(resolve => {
  const id = msgId++
  const handler = (data) => {
    const msg = JSON.parse(data)
    if (msg.id === id) { ws.off('message', handler); resolve(msg.result) }
  }
  ws.on('message', handler)
  ws.send(JSON.stringify({ id, method, params }))
})

// Enable necessary domains
await send('Page.enable')
await send('Runtime.enable')

// Navigate and wait for load
await send('Page.navigate', { url: URL })
await new Promise(r => {
  const handler = (data) => {
    const msg = JSON.parse(data)
    if (msg.method === 'Page.loadEventFired') { ws.off('message', handler); r() }
  }
  ws.on('message', handler)
})

// Extra wait for React to hydrate and CSS to apply
await new Promise(r => setTimeout(r, 3000))

// Take screenshot
const { data } = await send('Page.captureScreenshot', { format: 'png', quality: 90 })
writeFileSync(OUT, Buffer.from(data, 'base64'))
console.log('Screenshot saved:', OUT)

ws.close()
chrome.kill()
process.exit(0)
