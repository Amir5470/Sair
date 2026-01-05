const tabwrap = document.getElementById("sidetabs");
const input = document.getElementById("url");
function addTab() {
    const text = input.value.trim();
    if (!text) return;

    const newTab = document.createElement("div");
    newTab.className = "tab";
    newTab.textContent = text;
    tabwrap.appendChild(newTab);

    newTab.addEventListener("click", () => {
        document.getElementById("view").src = text.startsWith("http")
            ? text
            : "https://duckduckgo.com/?q=" + encodeURIComponent(text);
    });
}

