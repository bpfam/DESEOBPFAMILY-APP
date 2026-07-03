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
        console.error("Errore prodotti:", error);
        products = [];
    }
}

function openSection(section){
    const content = document.getElementById("content");

    if(section === "vetrina") showVetrina("Tutti");
    if(section === "recensioni") content.innerHTML = `<h2>⭐ Recensioni</h2><p>Foto, video e feedback clienti.</p>`;
    if(section === "vip") content.innerHTML = `<h2>👑 VIP Access</h2><p>Area riservata in preparazione.</p>`;
    if(section === "contatti") showContatti();
    if(section === "info") content.innerHTML = `<h2>ℹ️ Informazioni</h2><p>Solo per maggiorenni. Disponibile dove consentito dalla legge locale.</p>`;
    if(section === "carrello") showCart();
}

function getVariants(product){
    if(product.variants) return product.variants;

    if(product.formats){
        return Object.entries(product.formats).map(([size, price]) => ({
            size: size,
            price: price
        }));
    }

    return [{ size: "Info", price: "Info in chat" }];
}

function showVetrina(category){
    const content = document.getElementById("content");

    if(products.length === 0){
        content.innerHTML = `<h2>📸 Vetrina</h2><p>Caricamento catalogo...</p>`;
        return;
    }

    const categories = ["Tutti", ...new Set(products.map(p => p.category || "Altro"))];

    const filteredProducts = category === "Tutti"
        ? products
        : products.filter(product => product.category === category);

    const categoryHTML = categories.map(cat => `
        <button class="category-pill" onclick="showVetrina('${cat.replace(/'/g, "\\'")}')">${cat}</button>
    `).join("");

    const productHTML = filteredProducts.map(product => {
        const realIndex = products.indexOf(product);
        const variants = getVariants(product);

        const options = variants.map((variant, variantIndex) => `
            <option value="${variantIndex}">${variant.size}</option>
        `).join("");

        return `
            <div class="product-card">
                <img src="${product.image || "logo.jpg.PNG"}" class="product-img" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.category || ""}</p>

                <label class="format-label">Formato</label>
                <select class="format-select" id="variant-${realIndex}" onchange="updatePrice(${realIndex}, this.value)">
                    ${options}
                </select>

                <div class="product-meta">
                    <span>Disponibile</span>
                    <span id="price-${realIndex}">€${variants[0].price}</span>
                </div>

                <button class="contact-btn" onclick="addToCart(${realIndex})">🛒 Aggiungi al carrello</button>
                <a class="contact-btn" href="${contacts.telegram}" target="_blank">💬 Richiedi info</a>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <h2>📸 Vetrina</h2>
        <p>Catalogo ufficiale BPFAM.</p>
        <div class="category-row">${categoryHTML}</div>
        ${productHTML}
    `;
}

function updatePrice(index, variantIndex){
    const variants = getVariants(products[index]);
    document.getElementById(`price-${index}`).textContent = `€${variants[variantIndex].price}`;
}

function addToCart(index){
    const product = products[index];
    const variants = getVariants(product);
    const select = document.getElementById(`variant-${index}`);
    const selected = variants[select ? select.value : 0];

    cart.push({
        name: product.name,
        size: selected.size,
        price: selected.price
    });

    updateCartCount();
    alert("Aggiunto al carrello");
}

function updateCartCount(){
    const cartCount = document.getElementById("cartCount");
    if(cartCount) cartCount.textContent = cart.length;
}

function showCart(){
    const content = document.getElementById("content");

    if(cart.length === 0){
        content.innerHTML = `<h2>🛒 Carrello</h2><p>Il carrello è vuoto.</p>`;
        return;
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

    const cartHTML = cart.map((item, index) => `
        <div class="product-card">
            <h3>${item.name}</h3>
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
    `;
}

function removeFromCart(index){
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

function showContatti(){
    document.getElementById("content").innerHTML = `
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

function searchProducts(){
    const input = document.getElementById("searchInput");
    if(!input) return;

    const query = input.value.toLowerCase();
    if(query.length < 2) return;

    const results = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    document.getElementById("content").innerHTML = `
        <h2>🔍 Risultati ricerca</h2>
        ${results.map(product => `
            <div class="product-card">
                <img src="${product.image || "logo.jpg.PNG"}" class="product-img">
                <h3>${product.name}</h3>
                <p>${product.category}</p>
            </div>
        `).join("") || "<p>Nessun risultato trovato.</p>"}
    `;
}