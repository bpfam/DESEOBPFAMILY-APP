console.log("BPFAM App avviata");

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) splash.style.display = "none";
    }, 2200);
});

const products = [
    {
        name: "Articolo 1",
        category: "Novità",
        status: "Disponibile",
        description: "Scheda articolo ufficiale BPFAM.",
        tag: "Top",
        image: "logo.jpg.PNG",
        formats: {
            "Small": "Info in chat",
            "Medium": "Info in chat",
            "Large": "Info in chat"
        }
    },
    {
        name: "Articolo VIP",
        category: "VIP",
        status: "Su richiesta",
        description: "Articolo riservato agli utenti VIP.",
        tag: "VIP",
        image: "logo.jpg.PNG",
        formats: {
            "VIP": "Accesso riservato"
        }
    }
];

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
            content.innerHTML = `
                <h2>📞 Contatti</h2>
                <p>Telegram<br>Instagram<br>Signal</p>
            `;
        break;

        case "info":
            content.innerHTML = `
                <h2>ℹ️ Informazioni</h2>
                <p>Orari, Point attivi, Delivery e FAQ.</p>
            `;
        break;
    }
}

function showVetrina(category){
    const content = document.getElementById("content");

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

                <a class="contact-btn" href="#">Richiedi info</a>
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