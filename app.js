console.log("BPFAM App avviata");

let products = [];
let cart = [];

const contacts = {
    telegram: "#",
    instagram: "#",
    whatsapp: "#",
    signal: "#"
};

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
                <p>Solo per maggiorenni. Servizio disponibile esclusivamente dove consentito dalla legge locale.</p>
            `;
        break;

        case "carrello":
            showCart();
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

    const categories = ["Tutti", ...new Set(products.map(p => p.category))];

    const filteredProducts = category === "Tutti"
        ? products
        : products.filter(product => product.category === category);

    let categoryHTML = categories.map(cat => `
        <button class="category-pill" onclick="showVetrina('${cat}')">${cat}</button>
    `).join("");

    let productHTML = filteredProducts.map((product) => {
        const realIndex = products.indexOf(product);

        const options = product.variants.map((variant, variantIndex) => `
            <option value="${variantIndex}">${variant.size}</option>
        `).join("");

        return `
            <div class="product-card">
                <img src="${product.image}" class="product-img" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.category}</p>

                <label class="format-label">Formato</label>
                <select class="format-select" id="variant-${realIndex}" onchange="updatePrice(${realIndex}, this.value)">
                    ${options}
                </select>

                <div class="product-meta">
                    <span>Disponibile</span>
                    <span id="price-${realIndex}">€${product.variants[0].price}</span>
                </div>

                <button class="contact-btn" onclick="addToCart(${realIndex})">🛒 Aggiungi al carrello</button>
                <a class="contact-btn" href="${contacts.telegram}" target="_blank">💬 Richiedi info</a>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <h2>📸 Vetrina</h2>
        <p>Catalogo ufficiale BPFAM.</p>

        <div class="category-row">
            ${categoryHTML}
        </div>

        ${productHTML}
    `;
}

function updatePrice(index, variantIndex){
    const priceBox = document.getElementById(`price-${index}`);
    const selectedVariant = products[index].variants[variantIndex];

    if(priceBox){
        priceBox.textContent = `€${selectedVariant.price}`;
    }
}

function addToCart(index){
    const product = products[index];
    const variantSelect = document.getElementById(`variant-${index}`);
    const selectedIndex = variantSelect ? variantSelect.value : 0;
    const selectedVariant = product.variants[selectedIndex];

    cart.push({
        name: product.name,
        category: product.category,
        size: selectedVariant.size,
        price: selectedVariant.price
    });

    updateCartCount();
    alert("Aggiunto al carrello");
}

function updateCartCount(){
    const cartCount = document.getElementById("cartCount");
    if(cartCount){
        cartCount.textContent = cart.length;
    }
}

function showCart(){
    const content = document.getElementById("content");

    if(cart.length === 0){
        content.innerHTML = `
            <h2>🛒 Carrello</h2>
            <p>Il carrello è vuoto.</p>
        `;
        return;
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

    const cartHTML = cart.map((item, index) => `
        <div class="product-card">
            <h3>${item.name}</h3>
            <p>${item.category}</p>
            <p>Formato: ${item.size}</p>
            <div class="product-meta">
                <span>€${item.price}</span>
                <button onclick="removeFromCart(${index})">Rimuovi</button>
            </div>
        </div>
    `).join("");

    content.innerHTML = `
        <h2>🛒 Carrello</h2>
        ${cartHTML}
        <div class="product-card">
            <h3>Totale</h3>
            <p>€${total}</p>
        </div>
        <a class="contact-btn" href="${contacts.telegram}" target="_blank">Invia richiesta</a>
    `;
}

function removeFromCart(index){
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

function searchProducts(){
    const input = document.getElementById("searchInput");
    const query = input.value.toLowerCase();
    const content = document.getElementById("content");

    if(query.length < 2){
        return;
    }

    const results = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    let resultHTML = results.map(product => `
        <div class="product-card">
            <img src="${product.image}" class="product-img" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
        </div>
    `).join("");

    content.innerHTML = `
        <h2>🔍 Risultati ricerca</h2>
        ${resultHTML || "<p>Nessun risultato trovato.</p>"}
    `;
}