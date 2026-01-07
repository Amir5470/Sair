const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
    saveShortcuts: (data) => ipcRenderer.send('save-shortcuts', data),
    loadIndex: (query) => ipcRenderer.send('load-index', query),
    onOpenQuery: (callback) =>
        ipcRenderer.on('open-query', (_, query) => callback(query))
});
