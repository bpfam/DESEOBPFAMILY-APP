console.log("BPFAM App avviata");

let products = [];
let reviews = [];
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
    loadReviews();

    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) splash.style.display = "none";
    }, 2200);
});

async function loadProducts(){
    try{
        const response = await fetch("products.json");
        products = await response.json();
    }catch(error){
        products = [];
    }
}

async function loadReviews(){
    try{
        const response = await fetch("reviews.json");
        reviews = await response.json();
    }catch(error){
        reviews = [];
    }
}

function openSection(section){
    const content = document.getElementById("content");

    if(section === "vetrina") showVetrina("Tutti");
    if(section === "recensioni") showReviews();
    if(section === "vip") content.innerHTML = `<h2>👑 VIP Access</h2><p>Area riservata in preparazione.</p>`;
    if(section === "contatti") showContatti();
    if(section === "info") content.innerHTML = `<h2>ℹ️ Informazioni</h2><p>Solo per maggiorenni. Disponibile dove consentito dalla legge locale.</p>`;
    if(section === "carrello") showCart();
}

function showReviews(){
    const content = document.getElementById("content");

    if(reviews.length === 0){
        content.innerHTML = `<h2>⭐ Recensioni</h2><p>Nessuna recensione disponibile.</p>`;
        return;
    }

    content.innerHTML = `
        <h2>⭐ Recensioni</h2>
        <p>Feedback e contenuti verificati.</p>
        ${reviews.map(review => `
            <div class="product-card">
                ${review.type === "video"
                    ? `<video class="product-img" controls src="${review.media}"></video>`
                    : `<img src="${review.media}" class="product-img" alt="${review.title}">`
                }
                <h3>${review.title}</h3>
                <p>${"⭐".repeat(review.rating || 5)}</p>
                <p>${review.text}</p>
            </div>
        `).join("")}
    `;
}

function getVariants(product){
    if(product.variants) return product.variants;
    if(product.formats){
        return Object.entries(product.formats).map(([size, price]) => ({ size, price }));
    }
    return [{ size: "Info", price: 0 }];
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

                ${product.rating ? `
                    <div class="product-rating">
                        ⭐ ${product.rating}
                    </div>
                ` : ""}

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
    const priceBox = document.getElementById(`price-${index}`);
    if(priceBox) priceBox.textContent = `€${variants[variantIndex].price}`;
}

function addToCart(index){
    const product = products[index];
    const variants = getVariants(product);
    const select = document.getElementById(`variant-${index}`);
    const selected = variants[select ? select.value : 0];

    const existingItem = cart.find(item => item.name === product.name && item.size === selected.size);

    if(existingItem){
        existingItem.quantity += 1;
    }else{
        cart.push({
            name: product.name,
            category: product.category,
            size: selected.size,
            price: Number(selected.price || 0),
            quantity: 1
        });
    }

    updateCartCount();
    alert("Aggiunto al carrello");
}

function updateCartCount(){
    const cartCount = document.getElementById("cartCount");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCount) cartCount.textContent = totalItems;
}

function showCart(){
    const content = document.getElementById("content");

    if(cart.length === 0){
        content.innerHTML = `<h2>🛒 Carrello</h2><p>Il carrello è vuoto.</p>`;
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const cartHTML = cart.map((item, index) => `
        <div class="product-card">
            <h3>${item.name}</h3>
            <p>${item.category || ""}</p>
            <p>Formato: ${item.size}</p>

            <div class="qty-row">
                <button onclick="changeQuantity(${index}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>

            <div class="product-meta">
                <span>€${item.price * item.quantity}</span>
                <button class="remove-btn" onclick="removeFromCart(${index})">Rimuovi</button>
            </div>
        </div>
    `).join("");

    content.innerHTML = `
        <h2>🛒 Carrello</h2>
        ${cartHTML}

        <div class="product-card">
            <h3>Totale</h3>
            <p class="total-price">€${total}</p>
        </div>

        <label class="format-label">Metodo ordine</label>
        <select class="format-select" id="orderMethod" onchange="showOrderFields()">
            <option value="Meet Up">📍 Meet Up</option>
            <option value="Delivery">🚚 Delivery</option>
            <option value="Spedizione">📦 Spedizione</option>
        </select>

        <div id="orderFields"></div>

        <label class="format-label">Metodo pagamento</label>
        <select class="format-select" id="paymentMethod">
            <option value="Contanti">💵 Contanti</option>
            <option value="Crypto">₿ Crypto</option>
            <option value="Da concordare">💬 Da concordare</option>
        </select>

        <label class="format-label">Metodo contatto</label>
        <select class="format-select" id="checkoutContact">
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="signal">Signal</option>
        </select>

        <button class="contact-btn" onclick="sendOrder()">Invia richiesta</button>
    `;

    showOrderFields();
}

function showOrderFields(){
    const method = document.getElementById("orderMethod")?.value;
    const box = document.getElementById("orderFields");
    if(!box) return;

    if(method === "Spedizione"){
        box.innerHTML = `
            <label class="format-label">Nome e Cognome</label>
            <input class="format-select" id="fullName" placeholder="Nome e Cognome">

            <label class="format-label">Paese</label>
            <input class="format-select" id="country" placeholder="Paese">

            <label class="format-label">Regione / Stato</label>
            <input class="format-select" id="region" placeholder="Regione / Stato">

            <label class="format-label">Città</label>
            <input class="format-select" id="city" placeholder="Città">

            <label class="format-label">CAP</label>
            <input class="format-select" id="zip" placeholder="CAP">

            <label class="format-label">Via e numero civico</label>
            <input class="format-select" id="address" placeholder="Via e numero civico">

            <label class="format-label">Email</label>
            <input class="format-select" id="email" placeholder="Email">

            <label class="format-label">Telefono</label>
            <input class="format-select" id="phone" placeholder="Telefono">

            <label class="format-label">Corriere preferito</label>
            <select class="format-select" id="courier">
                <option value="UPS">UPS</option>
                <option value="DHL">DHL</option>
                <option value="FedEx">FedEx</option>
                <option value="Bartolini">Bartolini</option>
                <option value="InPost">InPost</option>
                <option value="Altro">Altro</option>
            </select>

            <label class="format-label">Note</label>
            <textarea class="format-select" id="notes" placeholder="Note"></textarea>
        `;
    }

    if(method === "Delivery"){
        box.innerHTML = `
            <label class="format-label">Nome e Cognome</label>
            <input class="format-select" id="fullName" placeholder="Nome e Cognome">

            <label class="format-label">Paese</label>
            <input class="format-select" id="country" placeholder="Paese">

            <label class="format-label">Regione / Stato</label>
            <input class="format-select" id="region" placeholder="Regione / Stato">

            <label class="format-label">Città</label>
            <input class="format-select" id="city" placeholder="Città">

            <label class="format-label">Indirizzo</label>
            <input class="format-select" id="address" placeholder="Indirizzo">

            <label class="format-label">Telefono</label>
            <input class="format-select" id="phone" placeholder="Telefono">

            <label class="format-label">Data desiderata</label>
            <input class="format-select" id="date" placeholder="Es. Martedì">

            <label class="format-label">Fascia oraria</label>
            <input class="format-select" id="time" placeholder="Es. 15:00 - 18:00">

            <label class="format-label">Note</label>
            <textarea class="format-select" id="notes" placeholder="Note"></textarea>
        `;
    }

    if(method === "Meet Up"){
        box.innerHTML = `
            <label class="format-label">Nome</label>
            <input class="format-select" id="fullName" placeholder="Nome">

            <label class="format-label">Paese</label>
            <input class="format-select" id="country" placeholder="Paese">

            <label class="format-label">Città</label>
            <input class="format-select" id="city" placeholder="Città">

            <label class="format-label">Zona incontro</label>
            <input class="format-select" id="zone" placeholder="Zona">

            <label class="format-label">Data</label>
            <input class="format-select" id="date" placeholder="Es. Martedì">

            <label class="format-label">Orario preferito</label>
            <input class="format-select" id="time" placeholder="Es. 18:30">

            <label class="format-label">Note</label>
            <textarea class="format-select" id="notes" placeholder="Note"></textarea>
        `;
    }
}

function changeQuantity(index, amount){
    cart[index].quantity += amount;
    if(cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartCount();
    showCart();
}

function removeFromCart(index){
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

function getValue(id){
    return document.getElementById(id)?.value || "";
}

function buildOrderMessage(){
    let message = "Ciao, vorrei informazioni per questo ordine:%0A%0A";

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}%0A`;
        message += `Formato: ${item.size}%0A`;
        message += `Quantità: ${item.quantity}%0A`;
        message += `Totale articolo: €${item.price * item.quantity}%0A%0A`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderMethod = getValue("orderMethod");
    const paymentMethod = getValue("paymentMethod");

    message += `Metodo ordine: ${orderMethod}%0A`;
    message += `Metodo pagamento: ${paymentMethod}%0A%0A`;

    message += `Dati ordine:%0A`;
    message += `Nome: ${getValue("fullName")}%0A`;
    message += `Paese: ${getValue("country")}%0A`;
    message += `Regione/Stato: ${getValue("region")}%0A`;
    message += `Città: ${getValue("city")}%0A`;
    message += `CAP: ${getValue("zip")}%0A`;
    message += `Indirizzo: ${getValue("address")}%0A`;
    message += `Email: ${getValue("email")}%0A`;
    message += `Telefono: ${getValue("phone")}%0A`;
    message += `Corriere: ${getValue("courier")}%0A`;
    message += `Zona: ${getValue("zone")}%0A`;
    message += `Data: ${getValue("date")}%0A`;
    message += `Orario: ${getValue("time")}%0A`;
    message += `Note: ${getValue("notes")}%0A%0A`;

    message += `Totale: €${total}`;

    return message;
}

function sendOrder(){
    const method = document.getElementById("checkoutContact").value;
    const message = buildOrderMessage();

    if(method === "telegram") window.open(`${contacts.telegram}`, "_blank");
    if(method === "whatsapp") window.open(`${contacts.whatsapp}?text=${message}`, "_blank");
    if(method === "signal") window.open(`${contacts.signal}`, "_blank");
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

                ${product.rating ? `
                    <div class="product-rating">
                        ⭐ ${product.rating}
                    </div>
                ` : ""}

                <p>${product.category}</p>
            </div>
        `).join("") || "<p>Nessun risultato trovato.</p>"}
    `;
}