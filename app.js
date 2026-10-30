
console.log("BPFAM App avviata");

let products = [];
let reviews = [];
let currentSection = "home";
let currentCategory = "Tutti";

const contacts = {
    telegram: "#",
    instagram: "#",
    whatsapp: "#",
    signal: "#"
};

const galleryPage = "vetrina-media.html";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("service-worker.js")
        .catch(error => {
            console.warn("Service worker:", error);
        });
}

function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );
}

function safeURL(value) {
    const url = String(value || "").trim();

    if (
        /^https:\/\//i.test(url) ||
        /^\.?\/?[a-zA-Z0-9_-][a-zA-Z0-9_./-]*$/.test(url)
    ) {
        return escapeHTML(url);
    }

    return "";
}

function getContent() {
    return document.getElementById("content");
}

window.addEventListener("load", async () => {
    await Promise.all([
        loadProducts(),
        loadReviews()
    ]);

    const splash = document.getElementById("splash");

    setTimeout(() => {
        if (splash) {
            splash.style.display = "none";
        }
    }, 2200);
});

async function loadProducts() {
    try {
        const response = await fetch("products.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Errore caricamento prodotti");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("products.json non è un array");
        }

        products = data;
        console.log("Contenuti caricati:", products.length);

    } catch (error) {
        console.error("Errore products.json:", error);
        products = [];
    }
}

async function loadReviews() {
    try {
        const response = await fetch("reviews.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Errore caricamento recensioni");
        }

        const data = await response.json();

        reviews = Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Errore reviews.json:", error);
        reviews = [];
    }
}

function openSection(section) {
    currentSection = section;

    const homeView = document.getElementById("homeView");
    const sectionView = document.getElementById("sectionView");
    const content = getContent();

    if (!content) {
        console.error("Elemento #content non trovato");
        return;
    }

    if (homeView) homeView.hidden = true;
    if (sectionView) sectionView.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    switch (section) {
        case "vetrina":
            showVetrina("Tutti");
            break;

        case "recensioni":
            showReviews();
            break;

        case "vip":
            content.innerHTML = `
                <h2>👑 VIP Access</h2>
                <p>Area riservata in preparazione.</p>
            `;
            break;

        case "contatti":
            showContatti();
            break;

        case "info":
            content.innerHTML = `
                <h2>ℹ️ Informazioni</h2>
                <p>Contenuti informativi per maggiorenni.</p>
            `;
            break;

        case "carrello":
            content.innerHTML = `
                <h2>Informazioni</h2>
                <p>Funzione ordini non disponibile.</p>
            `;
            break;

        default:
            content.innerHTML = `
                <h2>Sezione non disponibile</h2>
            `;
    }
}

function goHome() {
    currentSection = "home";

    const homeView = document.getElementById("homeView");
    const sectionView = document.getElementById("sectionView");

    if (sectionView) sectionView.hidden = true;
    if (homeView) homeView.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function galleryButton() {
    return `
        <a
            href="${galleryPage}"
            class="contact-btn"
            style="
                display:block;
                margin:20px 0;
                padding:18px;
                background:#d4af37;
                color:#000;
                border-radius:14px;
                text-align:center;
                text-decoration:none;
                font-weight:bold;
            "
        >
            🎬 CLICCA QUI PER I VIDEO
        </a>
    `;
}

function renderPhoto(item) {
    const image = safeURL(item.image);

    if (!image) {
        return `
            <img
                src="logo.jpg.PNG"
                class="product-img"
                alt="BPFAM"
                loading="lazy"
            >
        `;
    }

    return `
        <img
            src="${image}"
            class="product-img"
            alt="${escapeHTML(item.name || "Immagine")}"
            loading="lazy"
            onerror="this.onerror=null;this.src='logo.jpg.PNG'"
        >
    `;
}

function showVetrina(category = "Tutti") {
    currentCategory = category;

    const content = getContent();
    if (!content) return;

    if (products.length === 0) {
        content.innerHTML = `
            <h2>📸 Vetrina</h2>
            ${galleryButton()}
            <p>Contenuti non disponibili.</p>
            <button
                class="contact-btn"
                onclick="retryProducts()"
            >
                Riprova
            </button>
        `;
        return;
    }

    const categories = [
        "Tutti",
        ...new Set(
            products.map(item =>
                String(item.category || "Altro")
            )
        )
    ];

    const categoryHTML = categories.map((name, index) => `
        <button
            class="category-pill"
            data-category-index="${index}"
        >
            ${escapeHTML(name)}
        </button>
    `).join("");

    const filtered = category === "Tutti"
        ? products
        : products.filter(item =>
            item.category === category
        );

    const cards = filtered.map(item => `
        <div class="product-card">

            ${renderPhoto(item)}

            <h3>${escapeHTML(item.name || "Contenuto")}</h3>

            ${
                item.badge
                    ? `<div class="badge">${escapeHTML(item.badge)}</div>`
                    : ""
            }

            ${
                item.quality
                    ? `<p><strong>🏆 Qualità:</strong>
                       ${escapeHTML(item.quality)}</p>`
                    : ""
            }

            ${
                item.origin
                    ? `<p><strong>🌍 Origine:</strong>
                       ${escapeHTML(item.origin)}</p>`
                    : ""
            }

            <p>
                <strong>📂 Categoria:</strong>
                ${escapeHTML(item.category || "Altro")}
            </p>

        </div>
    `).join("");

    content.innerHTML = `
        <h2>📸 Vetrina BPFAM</h2>

        ${galleryButton()}

        <div class="category-row" id="categoryButtons">
            ${categoryHTML}
        </div>

        ${
            cards ||
            "<p>Nessun contenuto in questa categoria.</p>"
        }
    `;

    const buttons = document.querySelectorAll(
        "[data-category-index]"
    );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(
                button.dataset.categoryIndex
            );

            if (categories[index] !== undefined) {
                showVetrina(categories[index]);
            }
        });
    });
}

async function retryProducts() {
    const content = getContent();

    if (content) {
        content.innerHTML = "<p>Caricamento...</p>";
    }

    await loadProducts();

    if (currentSection === "vetrina") {
        showVetrina(currentCategory);
    }
}

function renderReviewMedia(review) {
    const url = safeURL(review.media);

    if (!url) return "";

    if (review.type === "video") {
        const match = String(review.media).match(
            /^https:\/\/(?:www\.)?streamable\.com\/(?:e\/)?([a-z0-9]+)\/?$/i
        );

        if (match) {
            return `
                <iframe
                    src="https://streamable.com/e/${match[1]}"
                    title="Video recensione"
                    style="width:100%;aspect-ratio:16/9;border:0;"
                    allow="fullscreen;picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
            `;
        }

        if (/\.mp4(?:\?|$)/i.test(url)) {
            return `
                <video
                    src="${url}"
                    controls
                    playsinline
                    preload="metadata"
                    style="width:100%;"
                ></video>
            `;
        }

        return "";
    }

    return `
        <img
            src="${url}"
            class="product-img"
            alt="${escapeHTML(review.title || "Recensione")}"
            loading="lazy"
        >
    `;
}

function showReviews() {
    const content = getContent();
    if (!content) return;

    if (reviews.length === 0) {
        content.innerHTML = `
            <h2>⭐ Recensioni</h2>
            <p>Nessuna recensione disponibile.</p>
        `;
        return;
    }

    content.innerHTML = `
        <h2>⭐ Recensioni</h2>

        ${reviews.map(review => `
            <div class="product-card">
                ${renderReviewMedia(review)}

                <h3>
                    ${escapeHTML(review.title || "Recensione")}
                </h3>

                <p>
                    ${"⭐".repeat(
                        Math.max(0, Math.min(
                            5,
                            Math.floor(Number(review.rating) || 5)
                        ))
                    )}
                </p>

                <p>${escapeHTML(review.text || "")}</p>
            </div>
        `).join("")}
    `;
}

function showContatti() {
    const content = getContent();
    if (!content) return;

    content.innerHTML = `
        <h2>📞 Contatti ufficiali</h2>

        <div class="contact-list">
            ${Object.entries(contacts).map(([name, url]) => `
                <a
                    class="contact-link"
                    href="${safeURL(url) || "#"}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(name.toUpperCase())}
                </a>
            `).join("")}
        </div>
    `;
}

function searchProducts() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim().toLowerCase();

    if (query.length < 2) return;

    const results = products.filter(item =>
        String(item.name || "")
            .toLowerCase()
            .includes(query) ||
        String(item.category || "")
            .toLowerCase()
            .includes(query)
    );

    const homeView = document.getElementById("homeView");
    const sectionView = document.getElementById("sectionView");
    const content = getContent();

    if (!content) return;

    if (homeView) homeView.hidden = true;
    if (sectionView) sectionView.hidden = false;

    currentSection = "ricerca";

    content.innerHTML = `
        <h2>🔍 Risultati ricerca</h2>

        <p>${results.length} risultati trovati.</p>

        ${galleryButton()}

        ${results.map(item => `
            <div class="product-card">
                ${renderPhoto(item)}

                <h3>
                    ${escapeHTML(item.name || "Contenuto")}
                </h3>

                <p>
                    ${escapeHTML(item.category || "")}
                </p>
            </div>
        `).join("") || "<p>Nessun risultato trovato.</p>"}
    `;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Compatibilità con eventuali pulsanti già presenti nell'HTML.
function updateCartCount() {
    ["cartCount", "sectionCartCount"].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = "0";
    });
}

updateCartCount();
