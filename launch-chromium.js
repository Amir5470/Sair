const { execFile, spawn } = require('child_process')
const { existsSync } = require('fs')
const path = require('path')

// Try common Chromium/Chrome executable names and locations on Windows
const candidates = [
  // Windows common install locations
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Chromium\\Application\\chromium.exe',
  process.env['PROGRAMFILES(X86)'] + '\\Chromium\\Application\\chromium.exe',
  process.env.LOCALAPPDATA + '\\Chromium\\Application\\chromium.exe',
  // generic names for PATH lookup
  'chrome',
  'chrome.exe',
  'chromium',
  'chromium-browser',
]

function findExecutable() {
  for (const c of candidates) {
    if (!c) continue
    try {
      if (existsSync(c)) return c
    } catch (e) {}
  }
  return null
}

async function openInChromium() {
  const indexPath = path.join(__dirname, 'index.html')
  const fileUrl = 'file://' + indexPath.replace(/\\/g, '/')

  // allow extra args passed after -- to be forwarded to Chrome
  // e.g. npm run chromium -- --kiosk --remote-debugging-port=9222
  const extraArgs = process.argv.slice(2)

  const exe = findExecutable()
  if (exe) {
    // spawn to inherit detached behavior
    const args = [].concat(extraArgs, [fileUrl])
    const child = spawn(exe, args, { detached: true, stdio: 'ignore' })
    child.unref()
    console.log('Launched Chromium/Chrome:', exe)
    process.exit(0)
    return
  }

  // Fallback: try start (Windows) or open (mac) or xdg-open (linux)
  const platform = process.platform
  if (platform === 'win32') {
    execFile('cmd', ['/c', 'start', '""', fileUrl], (err) => {
      if (err) {
        console.error('Failed to open with start:', err)
        process.exit(2)
      } else {
        console.log('Opened index.html with default browser')
        process.exit(0)
      }
    })
  } else if (platform === 'darwin') {
    execFile('open', [fileUrl], (err) => {
      if (err) {
        console.error('Failed to open with open:', err)
        process.exit(2)
      } else {
        console.log('Opened index.html with default browser')
        process.exit(0)
      }
    })
  } else {
    execFile('xdg-open', [fileUrl], (err) => {
      if (err) {
        console.error('Failed to open with xdg-open:', err)
        process.exit(2)
      } else {
        console.log('Opened index.html with default browser')
        process.exit(0)
      }
    })
  }
}

openInChromium()
