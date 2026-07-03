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
        name: "Prodotto 1",
        category: "Novità",
        status: "Disponibile",
        description: "Descrizione breve del prodotto.",
        tag: "Top"
    },
    {
        name: "Prodotto 2",
        category: "Limited",
        status: "Disponibile",
        description: "Descrizione breve del prodotto.",
        tag: "Limited"
    },
    {
        name: "Prodotto VIP",
        category: "VIP",
        status: "Su richiesta",
        description: "Prodotto riservato agli utenti VIP.",
        tag: "VIP"
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

    let productHTML = filteredProducts.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
                <span>${product.status}</span>
                <span>${product.tag}</span>
            </div>
            <a class="contact-btn" href="#">Richiedi info</a>
        </div>
    `).join("");

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