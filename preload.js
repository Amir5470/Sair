const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openURL: (url) => ipcRenderer.send('open-url', url)
})
