const tabwrap = document.getElementById("sidetabs");
const input = document.getElementById("url");
function addTab() {
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const view = document.getElementById('view');
    if (!tabwrap) return;

    const newTab = document.createElement("div");
    newTab.className = "tab";
    newTab.textContent = "New Tab";
    tabwrap.appendChild(newTab);

    if (view) {
        view.addEventListener('page-title-updated', (event) => {
            newTab.textContent = event.title || newTab.textContent;
        });
    }

    newTab.addEventListener("click", () => {
        const target = text.startsWith("http") ? text : "https://duckduckgo.com/?q=" + encodeURIComponent(text);
        const v = document.getElementById("view");
        if (v) v.src = target;
    });

    // trigger navigation immediately
    const target = text.startsWith("http") ? text : "https://duckduckgo.com/?q=" + encodeURIComponent(text);
    if (view) view.src = target;
}

window.oauth.onCode((code) => {
    console.log("Google OAuth code:", code);
    // Exchange code for tokens here
});
