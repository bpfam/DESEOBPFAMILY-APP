console.log("BPFAM App avviata");

let products = [];

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

window.addEventListener("load", () => {
    loadProducts();

    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) splash.style.display = "none";
    }, 2200);
});

const contacts = {
    telegram: "#",
    instagram: "#",
    whatsapp: "#",
    signal: "#"
};

async function loadProducts(){
    try{
        const response = await fetch("products.json");
        products = await response.json();
        console.log("Prodotti caricati:", products);
    }catch(error){
        console.error("Errore caricamento prodotti:", error);
        products = [];
    }
}

function openSection(section){
    const content = document.getElementById("content");

    switch(section){
        case "vetrina":
            showVetrina("Tutti");
        break;

        case "recensioni":
            content.innerHTML = `
                <h2>⭐ Recensioni</h2>
                <p>Qui compariranno foto, video e feedback dei clienti.</p>
            `;
        break;

        case "contatti":
            showContatti();
        break;

        case "info":
            content.innerHTML = `
                <h2>ℹ️ Informazioni</h2>
                <p>Orari, delivery, spedizioni e FAQ.</p>
            `;
        break;
    }
}

function showContatti(){
    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>📞 Contatti ufficiali</h2>
        <p>Scegli dove contattarci.</p>

        <div class="contact-list">
            <a class="contact-link" href="${contacts.telegram}" target="_blank">💬 Telegram</a>
            <a class="contact-link" href="${contacts.instagram}" target="_blank">📸 Instagram</a>
            <a class="contact-link" href="${contacts.whatsapp}" target="_blank">🟢 WhatsApp</a>
            <a class="contact-link" href="${contacts.signal}" target="_blank">🔐 Signal</a>
        </div>
    `;
}

function showVetrina(category){
    const content = document.getElementById("content");

    if(products.length === 0){
        content.innerHTML = `
            <h2>📸 Vetrina</h2>
            <p>Caricamento catalogo...</p>
        `;
        return;
    }

    const filteredProducts = category === "Tutti"
        ? products
        : products.filter(product => product.category === category || product.tag === category);

    let productHTML = filteredProducts.map((product, index) => {
        const options = Object.keys(product.formats).map(format => `
            <option value="${format}">${format}</option>
        `).join("");

        return `
            <div class="product-card">
                <img src="${product.image}" class="product-img" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>

                <label class="format-label">Formato</label>
                <select class="format-select" onchange="updatePrice(${index}, this.value)">
                    ${options}
                </select>

                <div class="product-meta">
                    <span>${product.status}</span>
                    <span id="price-${index}">${Object.values(product.formats)[0]}</span>
                </div>

                <a class="contact-btn" href="${contacts.telegram}" target="_blank">Richiedi info</a>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <h2>📸 Vetrina</h2>
        <p>Catalogo ufficiale BPFAM.</p>

        <div class="category-row">
            <button class="category-pill" onclick="showVetrina('Tutti')">Tutti</button>
            <button class="category-pill" onclick="showVetrina('Novità')">Novità</button>
            <button class="category-pill" onclick="showVetrina('Top')">Top</button>
            <button class="category-pill" onclick="showVetrina('Limited')">Limited</button>
            <button class="category-pill" onclick="showVetrina('VIP')">VIP</button>
        </div>

        ${productHTML}
    `;
}

function updatePrice(index, format){
    const priceBox = document.getElementById(`price-${index}`);
    priceBox.textContent = products[index].formats[format];
}