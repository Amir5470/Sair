const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const settingsPath = path.join(__dirname, 'settings.json')

// Load settings from settings.json
let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
} catch (e) {
  settings = { homepage: 'https://www.google.com' };
}

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

    newTab(url = this.homepage) {
      const container = document.getElementById('webviews')
      this.tabs.forEach(t => t.webview && (t.webview.style.display = 'none'))

      const wv = document.createElement('webview')
      wv.src = url
      wv.style.flex = '1'
      wv.style.width = '100%'
      wv.style.height = '100%'
      container.appendChild(wv)

      window.api.openURL(url)

      this.tabs.push({ title: url, url, webview: wv })
      this.activeTabIndex = this.tabs.length - 1
      this.url = url
    },

    switchTab(i) {
      this.tabs.forEach((t, j) => {
        if (t.webview) t.webview.style.display = j === i ? 'flex' : 'none'
      })
      this.activeTabIndex = i
      this.url = this.tabs[i].url
    },

    closeTab(i) {
      if (this.tabs[i].webview) this.tabs[i].webview.remove()
      this.tabs.splice(i, 1)
      if (this.activeTabIndex >= this.tabs.length) this.activeTabIndex = this.tabs.length - 1
      if (this.tabs.length) this.switchTab(this.activeTabIndex)
    }
  },
  mounted() {
    this.newTab(this.homepage)
  }
});
app.mount('#app')
// nav buttons
function navBtn(fn) {
  return () => {
    const wv = app._instance.proxy.tabs[app._instance.proxy.activeTabIndex]?.webview
    if (!wv) return
    if (fn == 'back' && wv.canGoBack()) wv.goBack()
    if (fn == 'forward' && wv.canGoForward()) wv.goForward()
    if (fn == 'reload') wv.reload()
  }
}

document.getElementById('backbtn')?.addEventListener('click', navBtn('back'))
document.getElementById('forwardbtn')?.addEventListener('click', navBtn('forward'))
document.getElementById('reloadbtn')?.addEventListener('click', navBtn('reload'))

// Use capture-phase listener and stopImmediatePropagation so we override
// other keydown handlers (including those that close the window).
window.addEventListener('keydown', e => {
  // Ignore if focus is inside an input, textarea or contenteditable element
  const active = document.activeElement
  const isEditable = active && (
    active.tagName === 'INPUT' ||
    active.tagName === 'TEXTAREA' ||
    active.isContentEditable
  )
  if (isEditable) return

  // Ctrl+W or Cmd (Meta)+W closes the current tab, not the window
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
    // Stop other listeners from handling this shortcut
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation()
    e.preventDefault() // Prevent default window close
    app._instance.proxy.closeTab(app._instance.proxy.activeTabIndex)
  }
}, true)

function toggleoverlay() {
  const taboverlay = document.getElementById('taboverlay')
  if (taboverlay.style.display === 'flex') {
    taboverlay.style.display = 'none'
    app._instance.proxy.overlayOpen = false
  } else {
    taboverlay.style.display = 'flex'
    app._instance.proxy.overlayOpen = true
    document.getElementById('urlsearch')?.focus()
  }
}

window.addEventListener('keydown', e => {
  const taboverlay = document.getElementById('taboverlay')
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
    app._instance.proxy.newTab()
    toggleoverlay()
    newtab()
    e.preventDefault()
  }
})
