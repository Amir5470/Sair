const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const settingsPath = path.join(__dirname, 'settings.json')


const app = Vue.createApp({
  data() {
    return {
      tabs: [],
      activeTabIndex: 0,
      url: settings.homepage,
      homepage: settings.homepage,
      showSettings: false,
      overlayOpen: false
    }
  },
  methods: {
    go() {
      let val = this.url.trim()
      const wv = this.tabs[this.activeTabIndex]?.webview
      if (!wv) return

      // special pages
      if (val == 'sair://settings') wv.loadURL(`file://${path.join(__dirname, 'settings.html')}`)
      else if (!/^https?:\/\//i.test(val)) wv.loadURL(`https://www.google.com/search?q=${encodeURIComponent(val)}`)
      else wv.loadURL(val)

      this.tabs[this.activeTabIndex].url = val
    },

  },
  mounted() {
    this.newTab(this.homepage)
  }
});
app.mount('#app')

document.getElementById('backbtn')?.addEventListener('click', navBtn('back'))
document.getElementById('forwardbtn')?.addEventListener('click', navBtn('forward'))
document.getElementById('reloadbtn')?.addEventListener('click', navBtn('reload'))

function navBtn(fn) {
  return () => {
    const wv = app._instance.proxy.tabs[app._instance.proxy.activeTabIndex]?.webview
    if (!wv) return
    if (fn == 'back' && wv.canGoBack()) wv.goBack()
    if (fn == 'forward' && wv.canGoForward()) wv.goForward()
    if (fn == 'reload') wv.reload()
  }
}


