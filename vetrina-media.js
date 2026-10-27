
console.log("BPFAM Vetrina multimediale avviata");

let mediaItems = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderVideo(url) {
    if (!url) return "";

    const videoUrl = String(url).trim();

    const match = videoUrl.match(
        /^https:\/\/(?:www\.)?streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)\/?(?:\?.*)?$/
    );

    if (match) {
        return `
            <div class="product-video-box">
                <iframe
                    src="https://streamable.com/e/${match[1]}"
                    title="Video BPFAM"
                    style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;"
                    allow="fullscreen; picture-in-picture"
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
    }

    if (/^https:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?$/i.test(videoUrl)) {
        return `
            <video
                controls
                playsinline
                preload="metadata"
                style="width:100%;border-radius:12px;"
                src="${escapeHTML(videoUrl)}">
            </video>
        `;
    }

    return "<p>Video non supportato.</p>";
}

function renderMedia(item) {
    const video = item.video
        ? renderVideo(item.video)
        : "";

    const photo = item.image
        ? `<img
             src="${escapeHTML(item.image)}"
             alt="${escapeHTML(item.name || "Immagine")}"
             style="width:100%;border-radius:12px;"
             loading="lazy">`
        : "";

    return video || photo ||
        '<p>Nessun contenuto multimediale.</p>';
}

function showMediaGallery(category = "Tutti") {
    const content = document.getElementById("mediaGallery");
    if (!content) return;

    const filtered = category === "Tutti"
        ? mediaItems
        : mediaItems.filter(item =>
            (item.category || "Altro") === category
        );

    content.innerHTML = filtered.map(item => `
        <article class="media-card">
            ${renderMedia(item)}
            <h3>${escapeHTML(item.name || "Contenuto")}</h3>
            <p>${escapeHTML(item.category || "")}</p>
        </article>
    `).join("") || "<p>Nessun contenuto disponibile.</p>";
}

async function loadMediaGallery() {
    const content = document.getElementById("mediaGallery");
    if (!content) return;

    try {
        const response = await fetch("media.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Errore caricamento media.json");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Il JSON deve contenere un array");
        }

        mediaItems = data;
        showMediaGallery();
    } catch (error) {
        console.error(error);
        content.textContent =
            "Impossibile caricare la galleria.";
    }
}

document.addEventListener("DOMContentLoaded", loadMediaGallery);
