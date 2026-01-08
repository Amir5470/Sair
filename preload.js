const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
    saveShortcuts: (data) => ipcRenderer.send('save-shortcuts', data),
    loadIndex: (query) => ipcRenderer.send('load-index', query),
    onOpenQuery: (callback) =>
        ipcRenderer.on('open-query', (_, query) => callback(query))
});

contextBridge.exposeInMainWorld('oauth', {
    onCode: (callback) => ipcRenderer.on('oauth-code', (e, code) => callback(code))
});

contextBridge.exposeInMainWorld('auth', {
    loginWithGoogle: () => ipcRenderer.send('login-google')
});

contextBridge.exposeInMainWorld('oauth', {
    onCode: (cb) => ipcRenderer.on('oauth-code', (e, data) => cb(data))
});
