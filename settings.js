const fs = require('fs')
const path = require('path')
const settingsPath = path.join(__dirname,'settings.json')


// default settings
try { settings = JSON.parse(fs.readFileSync(settingsPath)) } catch (e) { }

// save helper
function saveSettings() { fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2)) }
function toggleDarkMode(checked) { settings.darkMode = checked; saveSettings(); document.body.classList.toggle('dark-mode', checked); document.body.classList.toggle('light-mode', !checked) }
function changeAccent(color) { settings.accent = color; saveSettings(); document.body.className = document.body.className.replace(/\baccent-\w+\b/g, ''); document.body.classList.add(`accent-${color}`) }
function changeHomepage(url) { settings.homepage = url; saveSettings() }

document.getElementById('dark-mode-toggle')?.addEventListener('change', e => toggleDarkMode(e.target.checked))
document.getElementById('accent-color')?.addEventListener('change', e => changeAccent(e.target.value))
document.getElementById('homepage-input')?.addEventListener('change', e => changeHomepage(e.target.value))
// apply saved settings
document.body.classList.toggle('dark-mode', settings.darkMode)
document.body.classList.toggle('light-mode', !settings.darkMode)
document.body.classList.add(`accent-${settings.accent}`)


// default settings
let settings = {
  darkMode: false,
  accent: 'blue',
  searchEngine: 'google',
  homepage: 'https://google.com',
  sidebarWidth: 120
}

// load existing settings
try { settings = JSON.parse(fs.readFileSync(settingsPath)) } catch(e){}

// helper to save
function saveSettings(){ fs.writeFileSync(settingsPath, JSON.stringify(settings,null,2)) }

// dark mode
function toggleDarkMode(checked){
  settings.darkMode = checked
  saveSettings()
  document.body.classList.toggle('dark-mode', checked)
}

// accent
function changeAccent(color){
  settings.accent = color
  saveSettings()
  document.body.className = document.body.className.replace(/\baccent-\w+\b/g,'')
  document.body.classList.add(`accent-${color}`)
}

// homepage
function changeHomepage(url){
  settings.homepage = url
  saveSettings()
}

// search engine
function changeSearchEngine(engine){
  settings.searchEngine = engine
  saveSettings()
  // update UI if needed
  const display = document.querySelector('#search p')
  if(display) display.innerText = engine.charAt(0).toUpperCase() + engine.slice(1)
}

// engine toggle buttons
const changeButton = document.getElementById('change-engine')
function engineSwitch() {
  const buttons = document.querySelectorAll('.engine')
  buttons.forEach(button => {
    button.style.display = button.style.display === 'none' ? 'block' : 'none'
    button.addEventListener('click', e=>{
      changeSearchEngine(e.target.innerText.toLowerCase())
      engineSwitch()
    })
  })
}
if(changeButton) changeButton.addEventListener('click', engineSwitch)

// apply settings on load
window.addEventListener('DOMContentLoaded', ()=>{
  // dark mode
  document.body.classList.toggle('dark-mode', settings.darkMode)
  const toggle = document.getElementById('dark-mode-toggle')
  if(toggle){
    toggle.checked = settings.darkMode
    toggle.addEventListener('change', e=>toggleDarkMode(e.target.checked))
  }

  // accent
  document.body.classList.add(`accent-${settings.accent}`)
  const accentSelect = document.getElementById('accent-color')
  if(accentSelect) accentSelect.value = settings.accent

  // search engine display
  const display = document.querySelector('#search p')
  if(display) display.innerText = settings.searchEngine.charAt(0).toUpperCase() + settings.searchEngine.slice(1)

  // homepage input
  const homepageInput = document.getElementById('homepage-input')
  if(homepageInput) homepageInput.value = settings.homepage
  if(homepageInput) homepageInput.addEventListener('change', e=>changeHomepage(e.target.value))
})
