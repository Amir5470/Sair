document.addEventListener('DOMContentLoaded', () => {

    const popupOverlay = document.getElementById('popup-overlay');
    const openPopupButton = document.getElementById('shortcutbtn');
    const saveShortcutButton = document.getElementById('saveshortcut');

    if (!popupOverlay) return;

    function openPopup() {
        popupOverlay.style.display = 'flex';
    }

    function closePopup() {
        popupOverlay.style.display = 'none';
    }

    if (openPopupButton) {
        openPopupButton.addEventListener('click', openPopup);
    }

    if (saveShortcutButton) {
        saveShortcutButton.addEventListener('click', () => {
            closePopup();
        });
    }

    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) {
            closePopup();
        }
    });


    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePopup();
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const popupOverlay = document.getElementById('popup-overlay')
    const openPopupButton = document.getElementById('shortcutbtn')
    const saveShortcutButton = document.getElementById('saveshortcut')
    if (!popupOverlay) return

    function openPopup() {
        popupOverlay.style.display = 'flex'
    }

    function closePopup() {
        popupOverlay.style.display = 'none'
    }

    if (openPopupButton) {
        openPopupButton.addEventListener('click', openPopup)
    }

    if (saveShortcutButton) {
        saveShortcutButton.addEventListener('click', () => {
            const nameInput = document.querySelectorAll('.popupinput')[0]
            const urlInput = document.querySelectorAll('.popupinput')[1]
            const name = nameInput.value.trim()
            const url = urlInput.value.trim()

            if (name && url) {
                const bookmarks = document.getElementById('bookmarks')

                const shortcutDiv = document.createElement('div')
                shortcutDiv.className = 'shortcut'

                const btn = document.createElement('button')
                btn.className = 'shortcut-icon'
                btn.innerHTML = `<img src="https://www.google.com/s2/favicons?sz=64&domain=${url}" alt="${name}">`

                btn.addEventListener('click', () => {
                    const finalUrl = url.startsWith('http') ? url : 'https://' + url
                    window.open(finalUrl, '_blank')
                })

                const label = document.createElement('p')
                label.className = 'lexend-p'
                label.textContent = name

                shortcutDiv.appendChild(btn)
                shortcutDiv.appendChild(label)

                bookmarks.insertBefore(shortcutDiv, document.getElementById('addshortcut'))
            }

            nameInput.value = ''
            urlInput.value = ''
            closePopup()
        })
    }


    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) closePopup()
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePopup()
    })
})
// in home.html or renderer.js
const raw = localStorage.getItem('sair_settings');
if(raw){
  const s = JSON.parse(raw);
  document.documentElement.style.setProperty('--accent', s.accent || '#3579df');
  // change search behavior
  // if s.searchEngine === 'google' then use google query urls etc
}
