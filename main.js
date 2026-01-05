const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
})

let win

const createWindow = () => {
  win = new BrowserWindow({
    title: "Sair",
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,

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
