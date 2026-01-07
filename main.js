const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs');
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
})

const shortcutsPath = path.join(app.getPath('userData'), 'shortcuts.json');

let win

const createWindow = () => {
  win = new BrowserWindow({
    title: "Sair",
    width: 1000,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,

    }
  })

  win.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
  win.loadFile('home.html')
}

app.whenReady().then(() => {
  createWindow()
})

ipcMain.on('load-index', (e, query) => {
  win.loadFile('index.html').then(() => {
    win.webContents.send('open-query', query)
  })
})
app.setAboutPanelOptions({
  applicationName: "Sair",
  applicationVersion: "1.2"
})

function loadShortcuts() {
    try {
        if (fs.existsSync(shortcutsPath)) {
            const data = fs.readFileSync(shortcutsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Failed to load shortcuts:', err);
    }
    return [];
}

ipcMain.handle('get-shortcuts', () => {
    return loadShortcuts();
});

ipcMain.on('save-shortcuts', (event, shortcuts) => {
    try {
        fs.writeFileSync(shortcutsPath, JSON.stringify(shortcuts, null, 2));
    } catch (err) {
        console.error('Failed to save shortcuts:', err);
    }
});


