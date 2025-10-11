const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let win
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      sandbox: false,
      allowRunningInsecureContent: true, // allows http and other non-secure
      webSecurity: false, // lets you open file://, about:blank, etc
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

ipcMain.on('open-url', (e, url) => {
  if (view) view.webContents.loadURL(url)
})

