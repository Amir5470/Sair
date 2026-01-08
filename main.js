const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// -----------------------------
// Constants
// -----------------------------
const shortcutsPath = path.join(app.getPath('userData'), 'shortcuts.json');
const OAUTH_PORT = 3000;
const OAUTH_HOST = '127.0.0.1';
const OAUTH_REDIRECT_PATH = '/auth/callback';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '179481080318-4pttu0ukpr72dm1so6h9acaokcagvdja.apps.googleusercontent.com';

let win;
let lastOAuthState = null;

// -----------------------------
// Create Main Window
// -----------------------------
function createWindow() {
  win = new BrowserWindow({
    title: 'Sair',
    width: 1000,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  win.loadFile('home.html');
}

app.setAboutPanelOptions({
  applicationName: 'Sair',
  applicationVersion: '1.2'
});

// -----------------------------
// Shortcuts Storage
// -----------------------------
function loadShortcuts() {
  try {
    if (fs.existsSync(shortcutsPath)) {
      return JSON.parse(fs.readFileSync(shortcutsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load shortcuts:', err);
  }
  return [];
}

ipcMain.handle('get-shortcuts', () => loadShortcuts());

ipcMain.on('save-shortcuts', (event, shortcuts) => {
  try {
    fs.writeFileSync(shortcutsPath, JSON.stringify(shortcuts, null, 2));
  } catch (err) {
    console.error('Failed to save shortcuts:', err);
  }
});

// -----------------------------
// OAuth Local Redirect Server
// -----------------------------
function startOAuthServer(mainWindow) {
  if (startOAuthServer.server && startOAuthServer.listening) return;

  startOAuthServer.server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, `http://${OAUTH_HOST}:${OAUTH_PORT}`);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (code) {
        mainWindow.webContents.send('oauth-code', { code, state });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Login successful</h2><p>You can close this window.</p>');

        setTimeout(() => {
          try { startOAuthServer.server.close(); } catch {}
          startOAuthServer.listening = false;
        }, 800);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>No code found</h2>');
      }
    } catch (err) {
      console.error('OAuth server error:', err);
      res.writeHead(500);
      res.end('Server error');
    }
  });

  startOAuthServer.server.listen(OAUTH_PORT, OAUTH_HOST, () => {
    startOAuthServer.listening = true;
    console.log(`OAuth server listening at http://${OAUTH_HOST}:${OAUTH_PORT}${OAUTH_REDIRECT_PATH}`);
  });
}

// -----------------------------
// Google OAuth
// -----------------------------
function loginWithGoogle() {
  if (!CLIENT_ID || CLIENT_ID === '179481080318-4pttu0ukpr72dm1so6h9acaokcagvdja.apps.googleusercontent.com') {
    console.warn('Google CLIENT_ID not set.');
  }

  if (!startOAuthServer.listening) startOAuthServer(win);

  const state = crypto.randomBytes(16).toString('hex');
  lastOAuthState = state;

  const redirectUri = `http://${OAUTH_HOST}:${OAUTH_PORT}${OAUTH_REDIRECT_PATH}`;
  const scope = encodeURIComponent('profile email');

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  console.log('Opening system browser for Google OAuth:', authUrl);
  shell.openExternal(authUrl);
}

// -----------------------------
// IPC
// -----------------------------
ipcMain.on('login-google', () => loginWithGoogle());

ipcMain.on('load-index', (e, query) => {
  win.loadFile('index.html').then(() => {
    win.webContents.send('open-query', query);
  });
});

// -----------------------------
// App Lifecycle
// -----------------------------
app.whenReady().then(() => {
  createWindow();
  startOAuthServer(win);
});

app.on('window-all-closed', () => app.quit());

async function exchangeCodeForTokens(code) {
  const redirectUri = `http://${OAUTH_HOST}:${OAUTH_PORT}${OAUTH_REDIRECT_PATH}`;

  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET); // you MUST create this in Google console
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  return res.json();
}
