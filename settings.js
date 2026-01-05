const { ipcMain, BrowserWindow } = require('electron');

ipcMain.on('open-login-window', () => {
  const lw = new BrowserWindow({
    width: 520, height: 720, webPreferences:{ nodeIntegration:true, contextIsolation:false }
  });
  lw.loadFile('login.html');
});

ipcMain.on('open-settings-window', () => {
  const sw = new BrowserWindow({
    width: 1000, height: 800, webPreferences:{ nodeIntegration:true, contextIsolation:false }
  });
  sw.loadFile('settings.html');
});
