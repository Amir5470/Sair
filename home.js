document.addEventListener('DOMContentLoaded', async () => {
    let lastFinalUrl = null;

    window.gototab = function () {
        const input = document.getElementById('urlsearch');
        if (!input) return;

        const query = input.value.trim();
        if (!query) return;

        if (/^https?:\/\//i.test(query) || query.includes('.')) {
            lastFinalUrl = query.startsWith('http')
                ? query
                : 'https://' + query;
        } else {
            lastFinalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        }

        window.api.loadIndex(lastFinalUrl);
    };

    // ALT / OPTION listener
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Alt') return;

        const input = document.getElementById('urlsearch');
        if (!input) return;

        const query = input.value.trim();
        if (!query) return;

        let previewUrl;

        if (/^https?:\/\//i.test(query) || query.includes('.')) {
            previewUrl = query.startsWith('http')
                ? query
                : 'https://' + query;
        } else {
            previewUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        }

        console.log('ALT pressed, previewUrl:', previewUrl);
    });



    document.getElementById('urlsearch')
        ?.addEventListener('keydown', e => {
            if (e.key === 'Enter') gototab();
        });



    // Load saved shortcuts from JSON file
    const saved = await window.api.getShortcuts();
    saved.forEach(sc => addShortcutToDOM(sc.name, sc.url));

    // Popup elements
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

    // Open popup
    openPopupButton.addEventListener('click', openPopup);

    // Save shortcut
    saveShortcutButton.addEventListener('click', async () => {
        const nameInput = document.querySelectorAll('.popupinput')[0];
        const urlInput = document.querySelectorAll('.popupinput')[1];

        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        if (name && url) {
            const shortcuts = await window.api.getShortcuts();

            shortcuts.push({ name, url });

            window.api.saveShortcuts(shortcuts);

            addShortcutToDOM(name, url);
        }

        nameInput.value = '';
        urlInput.value = '';
        closePopup();
    });

    // Add shortcut to DOM (with delete + drag)
    function addShortcutToDOM(name, url) {
        const bookmarks = document.getElementById('bookmarks');

        const shortcutDiv = document.createElement('div');
        shortcutDiv.className = 'shortcut';
        shortcutDiv.draggable = true;

        const btn = document.createElement('button');
        btn.className = 'shortcut-icon';

        const img = document.createElement('img');
        img.src = `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
        img.alt = name;
        img.setAttribute('data-url', url);

        btn.appendChild(img);

        btn.addEventListener('click', () => {
            const finalUrl = url.startsWith('http') ? url : 'https://' + url;
            window.api.loadIndex(finalUrl);
        });

        const label = document.createElement('p');
        label.className = 'lexend-p';
        label.textContent = name;

        // DELETE BUTTON
        const del = document.createElement('button');
        del.className = 'delete-shortcut';
        del.textContent = '✕';

        del.addEventListener('click', async (e) => {
            e.stopPropagation();

            const shortcuts = await window.api.getShortcuts();
            const updated = shortcuts.filter(sc => !(sc.name === name && sc.url === url));

            window.api.saveShortcuts(updated);

            shortcutDiv.remove();
        });

        shortcutDiv.appendChild(btn);
        shortcutDiv.appendChild(label);
        shortcutDiv.appendChild(del);

        bookmarks.insertBefore(shortcutDiv, document.getElementById('addshortcut'));
    }

    // Close popup when clicking outside
    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) closePopup();
    });

    // Close popup with ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePopup();
    });

    // DRAG & DROP REORDERING
    let dragged = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('shortcut')) {
            dragged = e.target;
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    document.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('shortcut')) {
            e.preventDefault();
            const bookmarks = document.getElementById('bookmarks');
            const bounding = e.target.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2;

            if (e.clientY - offset > 0) {
                bookmarks.insertBefore(dragged, e.target.nextSibling);
            } else {
                bookmarks.insertBefore(dragged, e.target);
            }
        }
    });

    document.addEventListener('dragend', async () => {
        const bookmarks = document.getElementById('bookmarks');
        const items = [...bookmarks.querySelectorAll('.shortcut')];

        const newList = items.map(div => {
            const name = div.querySelector('p').textContent;
            const img = div.querySelector('img');
            const url = img.getAttribute('data-url');
            return { name, url };
        });

        window.api.saveShortcuts(newList);
    });

});
