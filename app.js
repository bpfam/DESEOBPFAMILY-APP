 
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
    updateCartCount();

    setTimeout(() => {
        const splash = document.getElementById("splash");

        if (splash) {
            splash.style.display = "none";
        }
    }, 2200);
});

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Impossibile caricare products.json");
        }

        products = await response.json();
    } catch (error) {
        console.error("Errore prodotti:", error);
        products = [];
    }
}

async function loadReviews() {
    try {
        const response = await fetch("reviews.json");

        if (!response.ok) {
            throw new Error("Impossibile caricare reviews.json");
        }

        reviews = await response.json();
    } catch (error) {
        console.error("Errore recensioni:", error);
        reviews = [];
    }
}

function openSection(section) {
    const homeView = document.getElementById("homeView");
    const sectionView = document.getElementById("sectionView");
    const content = document.getElementById("content");

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
                <p>
                    Solo per maggiorenni. Disponibile esclusivamente
                    dove consentito dalla normativa locale.
                </p>
            `;
            break;

        case "carrello":
            showCart();
            break;
    }

    updateCartCount();
}

function goHome() {
    const homeView = document.getElementById("homeView");
    const sectionView = document.getElementById("sectionView");

    if (sectionView) sectionView.hidden = true;
    if (homeView) homeView.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    updateCartCount();
}

function showReviews() {
    const content = document.getElementById("content");

    if (reviews.length === 0) {
        content.innerHTML = `
            <h2>⭐ Recensioni</h2>
            <p>Nessuna recensione disponibile.</p>
        `;
        return;
    }

    content.innerHTML = `
        <h2>⭐ Recensioni</h2>
        <p>Feedback e contenuti verificati.</p>

        ${reviews.map(review => `
            <div class="product-card">

                ${
                    review.type === "video"
                        ? `
                            <video
                                class="product-video"
                                controls
                                playsinline
                                preload="metadata"
                                src="${review.media}"
                            ></video>
                        `
                        : `
                            <img
                                src="${review.media}"
                                class="product-img"
                                alt="${review.title || "Recensione"}"
                                loading="lazy"
                            >
                        `
                }

                <h3>${review.title || "Recensione"}</h3>

                <p>
                    ${"⭐".repeat(Number(review.rating) || 5)}
                </p>

                <p>${review.text || ""}</p>
            </div>
        `).join("")}
    `;
}

function getVariants(product) {
    if (
        Array.isArray(product.variants) &&
        product.variants.length > 0
    ) {
        return product.variants;
    }

    if (product.formats) {
        return Object.entries(product.formats).map(
            ([size, price]) => ({
                size,
                price
            })
        );
    }

    return [
        {
            size: "Info",
            price: 0
        }
    ];
}

function showVetrina(category) {
    const content = document.getElementById("content");

    if (products.length === 0) {
        content.innerHTML = `
            <h2>📸 Vetrina</h2>
            <p>Catalogo non disponibile.</p>

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
            products.map(
                product => product.category || "Altro"
            )
        )
    ];

    const filteredProducts =
        category === "Tutti"
            ? products
            : products.filter(
                product => product.category === category
            );

    const categoryHTML = categories.map(item => {

        const safeCategory = String(item).replace(
            /'/g,
            "\\'"
        );

        return `
            <button
                class="category-pill"
                onclick="showVetrina('${safeCategory}')"
            >
                ${item}
            </button>
        `;
    }).join("");

    const productHTML = filteredProducts.map(product => {

        const realIndex = products.indexOf(product);
        const variants = getVariants(product);
        const firstVariant = variants[0];

        const options = variants.map(
            (variant, variantIndex) => `
                <option value="${variantIndex}">
                    ${variant.size}
                </option>
            `
        ).join("");

        return `
            <div class="product-card">

                ${
                    product.badge
                        ? `
                            <div class="badge">
                                ${product.badge}
                            </div>
                        `
                        : ""
                }

                ${
                    product.image
                        ? `
                            <img
                                src="${product.image}"
                                class="product-img"
                                alt="${product.name || "Prodotto"}"
                                loading="lazy"
                                onerror="this.src='logo.jpg.PNG'"
                            >
                        `
                        : `
                            <img
                                src="logo.jpg.PNG"
                                class="product-img"
                                alt="${product.name || "Prodotto"}"
                            >
                        `
                }

                ${
                    product.video
                        ? `
                            <div class="product-video-box">

                                <div class="video-label">
                                    ▶️ Video prodotto
                                </div>

                                <video
                                    class="product-video"
                                    controls
                                    playsinline
                                    preload="metadata"
                                    poster="${product.image || "logo.jpg.PNG"}"
                                >
                                    <source
                                        src="${product.video}"
                                        type="video/mp4"
                                    >

                                    Il tuo dispositivo non supporta il video.
                                </video>

                            </div>
                        `
                        : ""
                }

                <h3>${product.name || "Prodotto"}</h3>

                ${
                    product.rating
                        ? `
                            <div class="product-rating">
                                ⭐ ${product.rating}
                            </div>
                        `
                        : ""
                }

                ${
                    product.quality
                        ? `
                            <p>
                                <strong>🏆 Qualità:</strong>
                                ${product.quality}
                            </p>
                        `
                        : ""
                }

                ${
                    product.origin
                        ? `
                            <p>
                                <strong>🌍 Origine:</strong>
                                ${product.origin}
                            </p>
                        `
                        : ""
                }

                <p>
                    <strong>📂 Categoria:</strong>
                    ${product.category || "Altro"}
                </p>

                <label class="format-label">
                    Formato

                    <span class="format-hint">
                        Tocca per vedere altri formati
                    </span>
                </label>

                <select
                    class="format-select"
                    id="variant-${realIndex}"
                    onchange="updatePrice(${realIndex}, this.value)"
                >
                    ${options}
                </select>

                <div class="product-meta">

                    <span>
                        ${product.status || "Disponibile"}
                    </span>

                    <span id="price-${realIndex}">
                        €${firstVariant.price}
                    </span>

                </div>

                <button
                    class="contact-btn"
                    onclick="addToCart(${realIndex})"
                >
                    🛒 Aggiungi al carrello
                </button>

                    <a href="https://bpfam.github.io/Video-bpfam/"
   class="contact-btn">
    🎬 CLICCA QUI PER I VIDEO
</a>

            </div>
        `;
    }).join("");

    content.innerHTML = `
        <h2>📸 Vetrina</h2>

       <p>Catalogo ufficiale BPFAM.</p>

        <div class="category-row">
            ${categoryHTML}
        </div>

        ${
            productHTML ||
            "<p>Nessun prodotto presente in questa categoria.</p>"
        }
    `;
}

async function retryProducts() {
    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>📸 Vetrina</h2>
        <p>Caricamento catalogo...</p>
    `;

    await loadProducts();

    showVetrina("Tutti");
}

function updatePrice(index, variantIndex) {

    const product = products[index];

    if (!product) return;

    const variants = getVariants(product);

    const selectedVariant =
        variants[Number(variantIndex)];

    const priceBox =
        document.getElementById(`price-${index}`);

    if (priceBox && selectedVariant) {

        priceBox.textContent =
            `€${selectedVariant.price}`;
    }
}

function addToCart(index) {

    const product = products[index];

    if (!product) return;

    const variants = getVariants(product);

    const select =
        document.getElementById(`variant-${index}`);

    const selectedIndex =
        select ? Number(select.value) : 0;

    const selected =
        variants[selectedIndex] || variants[0];

    const existingItem = cart.find(item =>
        item.name === product.name &&
        item.size === selected.size
    );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            name: product.name,
            category: product.category || "",
            size: selected.size,
            price: Number(selected.price || 0),
            quantity: 1
        });
    }

    updateCartCount();

    alert("Aggiunto al carrello");
}

function updateCartCount() {

    const totalItems = cart.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    const homeCartCount =
        document.getElementById("cartCount");

    const sectionCartCount =
        document.getElementById("sectionCartCount");

    if (homeCartCount) {

        homeCartCount.textContent =
            totalItems;
    }

    if (sectionCartCount) {

        sectionCartCount.textContent =
            totalItems;
    }
}

function showCart() {

    const content =
        document.getElementById("content");

    if (cart.length === 0) {

        content.innerHTML = `
            <h2>🛒 Carrello</h2>

            <p>
                Il carrello è vuoto.
            </p>

            <button
                class="contact-btn"
                onclick="openSection('vetrina')"
            >
                Apri la Vetrina
            </button>
        `;

        return;
    }

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const cartHTML = cart.map(
        (item, index) => `
            <div class="product-card">

                <h3>${item.name}</h3>

                <p>
                    ${item.category || ""}
                </p>

                <p>
                    Formato: ${item.size}
                </p>

                <div class="qty-row">

                    <button
                        onclick="changeQuantity(${index}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(${index}, 1)"
                    >
                        +
                    </button>

                </div>

                <div class="product-meta">

                    <span>
                        €${item.price * item.quantity}
                    </span>

                    <button
                        class="remove-btn"
                        onclick="removeFromCart(${index})"
                    >
                        Rimuovi
                    </button>

                </div>

            </div>
        `
    ).join("");

    content.innerHTML = `
        <h2>🛒 Carrello</h2>

        ${cartHTML}

        <button
            class="remove-btn"
            onclick="clearCart()"
            style="width:100%; margin-top:15px;"
        >
            Svuota carrello
        </button>

        <div class="product-card">

            <h3>
                Totale
            </h3>

            <p class="total-price">
                €${total}
            </p>

        </div>

        <label class="format-label">
            Metodo ordine
        </label>

        <select
            class="format-select"
            id="orderMethod"
            onchange="showOrderFields()"
        >
            <option value="Meet Up">
                📍 Meet Up
            </option>

            <option value="Delivery">
                🚚 Delivery
            </option>

            <option value="Spedizione">
                📦 Spedizione
            </option>
        </select>

        <div id="orderFields"></div>

        <label class="format-label">
            Metodo pagamento
        </label>

        <select
            class="format-select"
            id="paymentMethod"
        >
            <option value="Contanti">
                💵 Contanti
            </option>

            <option value="Crypto">
                ₿ Crypto
            </option>

            <option value="Da concordare">
                💬 Da concordare
            </option>
        </select>

        <label class="format-label">
            Metodo contatto
        </label>

        <select
            class="format-select"
            id="checkoutContact"
        >
            <option value="telegram">
                Telegram
            </option>

            <option value="signal">
                Signal
            </option>
        </select>

        <button
            class="contact-btn"
            onclick="sendOrder()"
        >
            Invia richiesta
        </button>
    `;

    showOrderFields();
}


/* DESEO BP FAMILY
   MODULO INFORMATIVO INDIPENDENTE
   Nessun ordine o pagamento
*/

(function () {
  const root = document.getElementById("moduloLegale");
  if (!root) return;

  const localita = {
    Italia: {
      Puglia: [
        "Bisceglie", "Bari", "Trani",
        "Barletta", "Andria", "Molfetta",
        "Foggia", "Lecce", "Taranto", "Brindisi"
      ],
      Basilicata: ["Potenza", "Matera"],
      Calabria: ["Catanzaro", "Cosenza", "Reggio Calabria"],
      Campania: ["Napoli", "Salerno", "Caserta"],
      Lazio: ["Roma", "Latina", "Frosinone"],
      Lombardia: ["Milano", "Bergamo", "Brescia"],
      Piemonte: ["Torino", "Novara"],
      Veneto: ["Venezia", "Verona", "Padova"],
      Emilia_Romagna: ["Bologna", "Parma", "Modena"],
      Toscana: ["Firenze", "Pisa", "Livorno"]
    },

    Spagna: {
      Catalogna: ["Barcellona", "Girona", "Tarragona"],
      Valencia: ["Valencia", "Alicante", "Elche"],
      Madrid: ["Madrid", "Alcalá de Henares"],
      Andalusia: ["Siviglia", "Malaga", "Granada"]
    },

    Francia: {
      "Île-de-France": ["Parigi", "Versailles"],
      "Provenza-Alpi-Costa Azzurra": ["Marsiglia", "Nizza", "Cannes"],
      "Alvernia-Rodano-Alpi": ["Lione", "Grenoble"]
    },

    Germania: {
      Berlino: ["Berlino"],
      Baviera: ["Monaco", "Norimberga"],
      Assia: ["Francoforte", "Wiesbaden"],
      Amburgo: ["Amburgo"]
    },

    "Paesi Bassi": {
      "Olanda Settentrionale": ["Amsterdam", "Haarlem"],
      "Olanda Meridionale": ["Rotterdam", "L'Aia"],
      Utrecht: ["Utrecht"],
      "Brabante Settentrionale": ["Eindhoven"]
    }
  };

  root.innerHTML = `
    <style>
      #moduloLegale {
        color: #fff;
        font-family: Arial, sans-serif;
        max-width: 480px;
        margin: 20px auto;
      }

      #moduloLegale .ml-card {
        background: #111;
        border: 1px solid #b89532;
        border-radius: 18px;
        padding: 20px;
        margin-bottom: 20px;
      }

      #moduloLegale h2 {
        color: #d4af37;
        margin-bottom: 16px;
        font-size: 21px;
      }

      #moduloLegale label {
        display: block;
        color: #d4af37;
        font-weight: bold;
        margin: 14px 0 7px;
      }

      #moduloLegale input,
      #moduloLegale select,
      #moduloLegale textarea {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 13px;
        background: #181818;
        color: white;
        border: 1px solid #8e742b;
        border-radius: 12px;
        font-size: 15px;
      }

      #moduloLegale input[readonly] {
        color: #ddd;
        background: #222;
      }

      #moduloLegale p {
        color: #ccc;
        line-height: 1.5;
        margin: 12px 0;
      }

      #moduloLegale .ml-hidden {
        display: none;
      }
    </style>

    <div class="ml-card">
      <h2>📍 Meet Up — Informazioni</h2>

      <label>Stato</label>
      <input value="Italia" readonly>

      <label>Regione</label>
      <input value="Puglia" readonly>

      <label>Città</label>
      <input value="Bisceglie" readonly>

      <label>CAP</label>
      <input value="76011" readonly>

      <p>Il luogo preciso viene concordato in chat.</p>
    </div>

    <div class="ml-card">
      <h2>📦 Modulo indirizzo</h2>

      <label for="mlName">Nome e cognome</label>
      <input id="mlName" autocomplete="name"
             placeholder="Nome e cognome">

      <label for="mlCountry">🌍 Stato</label>
      <select id="mlCountry">
        <option value="">Seleziona lo Stato</option>
      </select>

      <label for="mlRegion">📍 Regione / Provincia</label>
      <select id="mlRegion" disabled>
        <option value="">Seleziona prima lo Stato</option>
      </select>

      <label for="mlCity">🏙️ Città</label>
      <select id="mlCity" disabled>
        <option value="">Seleziona prima la Regione</option>
      </select>

      <label for="mlOtherCity">Altra città</label>
      <input id="mlOtherCity"
             placeholder="Scrivi la città se non è nell'elenco"
             class="ml-hidden">

      <label for="mlZip">📮 CAP / Codice postale</label>
      <input id="mlZip" autocomplete="postal-code"
             placeholder="Codice postale">

      <label for="mlAddress">🏠 Via e numero civico</label>
      <input id="mlAddress" autocomplete="street-address"
             placeholder="Via e numero civico">

      <label for="mlPhone">📱 Numero di cellulare</label>
      <input id="mlPhone" type="tel" autocomplete="tel"
             placeholder="+39 ...">

      <label for="mlEmail">✉️ Email</label>
      <input id="mlEmail" type="email" autocomplete="email"
             placeholder="email@esempio.com">

      <label for="mlCourier">🚚 Corriere preferito</label>
      <select id="mlCourier">
        <option value="">Nessuna preferenza</option>
        <option>UPS</option>
        <option>DHL</option>
        <option>FedEx</option>
        <option>BRT</option>
        <option>InPost</option>
        <option>Altro</option>
      </select>

      <label for="mlNotes">📝 Note</label>
      <textarea id="mlNotes" rows="3"
                placeholder="Note facoltative"></textarea>

      <p>Questo modulo è dimostrativo:
         non invia né salva i dati inseriti.</p>
    </div>
  `;

  const country = root.querySelector("#mlCountry");
  const region = root.querySelector("#mlRegion");
  const city = root.querySelector("#mlCity");
  const otherCity = root.querySelector("#mlOtherCity");

  function fillOptions(select, values, placeholder) {
    select.innerHTML = "";
    select.add(new Option(placeholder, ""));

    values.forEach(value => {
      const label = value.replaceAll("_", " ");
      select.add(new Option(label, value));
    });
  }

  fillOptions(
    country,
    Object.keys(localita),
    "Seleziona lo Stato"
  );

  country.addEventListener("change", () => {
    const regions = localita[country.value] || {};

    fillOptions(
      region,
      Object.keys(regions),
      "Seleziona la Regione"
    );

    region.disabled = !country.value;

    fillOptions(city, [], "Seleziona prima la Regione");
    city.disabled = true;
    otherCity.classList.add("ml-hidden");
    otherCity.value = "";
  });

  region.addEventListener("change", () => {
    const cities =
      localita[country.value]?.[region.value] || [];

    fillOptions(city, cities, "Seleziona la Città");
    city.add(new Option("Altra città...", "__other__"));
    city.disabled = !region.value;

    otherCity.classList.add("ml-hidden");
    otherCity.value = "";
  });

  city.addEventListener("change", () => {
    otherCity.classList.toggle(
      "ml-hidden",
      city.value !== "__other__"
    );
  });
})();

    if (method === "Delivery") {

        box.innerHTML = `
            <label class="format-label">
                Nome e Cognome
            </label>

            <input
                class="format-select"
                id="fullName"
                placeholder="Nome e Cognome"
            >

            <label class="format-label">
                Paese
            </label>

            <input
                class="format-select"
                id="country"
                placeholder="Paese"
            >

            <label class="format-label">
                Regione / Stato
            </label>

            <input
                class="format-select"
                id="region"
                placeholder="Regione / Stato"
            >

            <label class="format-label">
                Città
            </label>

            <input
                class="format-select"
                id="city"
                placeholder="Città"
            >

            <label class="format-label">
                Indirizzo
            </label>

            <input
                class="format-select"
                id="address"
                placeholder="Indirizzo"
            >

            <label class="format-label">
                Telefono
            </label>

            <input
                class="format-select"
                id="phone"
                type="tel"
                placeholder="Telefono"
            >

            <label class="format-label">
                Data desiderata
            </label>

            <input
                class="format-select"
                id="date"
                type="date"
            >

            <label class="format-label">
                Fascia oraria
            </label>

            <input
                class="format-select"
                id="time"
                placeholder="Es. 15:00 - 18:00"
            >

            <label class="format-label">
                Note
            </label>

            <textarea
                class="format-select"
                id="notes"
                placeholder="Note"
            ></textarea>
        `;
    }

    if (method === "Meet Up") {

        box.innerHTML = `
            <label class="format-label">
                Nome
            </label>

            <input
                class="format-select"
                id="fullName"
                placeholder="Nome"
            >

            <label class="format-label">
                Paese
            </label>

            <input
                class="format-select"
                id="country"
                placeholder="Paese"
            >

            <label class="format-label">
                Città
            </label>

            <input
                class="format-select"
                id="city"
                placeholder="Città"
            >

            <label class="format-label">
                Zona incontro
            </label>

            <input
                class="format-select"
                id="zone"
                placeholder="Zona"
            >

            <label class="format-label">
                Data
            </label>

            <input
                class="format-select"
                id="date"
                type="date"
            >

            <label class="format-label">
                Orario preferito
            </label>

            <input
                class="format-select"
                id="time"
                type="time"
            >

            <label class="format-label">
                Note
            </label>

            <textarea
                class="format-select"
                id="notes"
                placeholder="Note"
            ></textarea>
        `;
    }
}

function changeQuantity(index, amount) {

    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);
    }

    updateCartCount();

    showCart();
}

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCartCount();

    showCart();
}

function clearCart() {

    cart = [];

    updateCartCount();

    showCart();
}

function getValue(id) {

    return (
        document.getElementById(id)?.value.trim() || ""
    );
}

function buildOrderMessage() {

    let message =
        "Ciao, vorrei informazioni per questo ordine:\n\n";

    cart.forEach((item, index) => {

        message +=
            `${index + 1}. ${item.name}\n`;

        message +=
            `Formato: ${item.size}\n`;

        message +=
            `Quantità: ${item.quantity}\n`;

        message +=
            `Totale articolo: €${item.price * item.quantity}\n\n`;
    });

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const orderMethod =
        getValue("orderMethod");

    const paymentMethod =
        getValue("paymentMethod");

    message +=
        `Metodo ordine: ${orderMethod}\n`;

    message +=
        `Metodo pagamento: ${paymentMethod}\n\n`;

    message += "Dati ordine:\n";

    message +=
        `Nome: ${getValue("fullName")}\n`;

    message +=
        `Paese: ${getValue("country")}\n`;

    message +=
        `Regione/Stato: ${getValue("region")}\n`;

    message +=
        `Città: ${getValue("city")}\n`;

    message +=
        `CAP: ${getValue("zip")}\n`;

    message +=
        `Indirizzo: ${getValue("address")}\n`;

    message +=
        `Email: ${getValue("email")}\n`;

    message +=
        `Telefono: ${getValue("phone")}\n`;

    message +=
        `Corriere: ${getValue("courier")}\n`;

    message +=
        `Zona: ${getValue("zone")}\n`;

    message +=
        `Data: ${getValue("date")}\n`;

    message +=
        `Orario: ${getValue("time")}\n`;

    message +=
        `Note: ${getValue("notes")}\n\n`;

    message +=
        `Totale: €${total}`;

    return message;
}

function sendOrder() {

    if (cart.length === 0) {

        alert("Il carrello è vuoto.");

        return;
    }

    const method =
        document.getElementById("checkoutContact")?.value;

    const message =
        buildOrderMessage();

    const encodedMessage =
        encodeURIComponent(message);

    if (method === "telegram") {

        window.open(
            contacts.telegram,
            "_blank"
        );
    }

    if (method === "whatsapp") {

        const separator =
            contacts.whatsapp.includes("?")
                ? "&"
                : "?";

        window.open(
            `${contacts.whatsapp}${separator}text=${encodedMessage}`,
            "_blank"
        );
    }

    if (method === "signal") {

        window.open(
            contacts.signal,
            "_blank"
        );
    }
}

function showContatti() {

    const content =
        document.getElementById("content");

    content.innerHTML = `
        <h2>📞 Contatti ufficiali</h2>

        <p>
            Scegli dove contattarci.
        </p>

        <div class="contact-list">

            <a
                class="contact-link"
                href="${contacts.telegram}"
                target="_blank"
                rel="noopener noreferrer"
            >
                💬 Telegram
            </a>

            <a
                class="contact-link"
                href="${contacts.instagram}"
                target="_blank"
                rel="noopener noreferrer"
            >
                📸 Instagram
            </a>

            <a
                class="contact-link"
                href="${contacts.whatsapp}"
                target="_blank"
                rel="noopener noreferrer"
            >
                🟢 WhatsApp
            </a>

            <a
                class="contact-link"
                href="${contacts.signal}"
                target="_blank"
                rel="noopener noreferrer"
            >
                🔐 Signal
            </a>

        </div>
    `;
}

function searchProducts() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const query =
        input.value.trim().toLowerCase();

    if (query.length < 2) return;

    const homeView =
        document.getElementById("homeView");

    const sectionView =
        document.getElementById("sectionView");

    if (homeView) {

        homeView.hidden = true;
    }

    if (sectionView) {

        sectionView.hidden = false;
    }

    const results =
        products.filter(product =>

            String(product.name || "")
                .toLowerCase()
                .includes(query)

            ||

            String(product.category || "")
                .toLowerCase()
                .includes(query)
        );

    document.getElementById("content").innerHTML = `
        <h2>🔍 Risultati ricerca</h2>

        <p>
            ${results.length} risultati trovati.
        </p>

        ${
            results.map(product => `
                <div class="product-card">

                    ${
                        product.image
                            ? `
                                <img
                                    src="${product.image}"
                                    class="product-img"
                                    alt="${product.name || "Prodotto"}"
                                    loading="lazy"
                                    onerror="this.src='logo.jpg.PNG'"
                                >
                            `
                            : ""
                    }

                    ${
                        product.video
                            ? `
                                <video
                                    class="product-video"
                                    controls
                                    playsinline
                                    preload="metadata"
                                    poster="${product.image || "logo.jpg.PNG"}"
                                >
                                    <source
                                        src="${product.video}"
                                        type="video/mp4"
                                    >
                                </video>
                            `
                            : ""
                    }

                    <h3>
                        ${product.name || "Prodotto"}
                    </h3>

                    ${
                        product.badge
                            ? `
                                <div class="badge">
                                    ${product.badge}
                                </div>
                            `
                            : ""
                    }

                    ${
                        product.rating
                            ? `
                                <div class="product-rating">
                                    ⭐ ${product.rating}
                                </div>
                            `
                            : ""
                    }

                    ${
                        product.quality
                            ? `
                                <p>
                                    <strong>🏆 Qualità:</strong>
                                    ${product.quality}
                                </p>
                            `
                            : ""
                    }

                    ${
                        product.origin
                            ? `
                                <p>
                                    <strong>🌍 Origine:</strong>
                                    ${product.origin}
                                </p>
                            `
                            : ""
                    }

                    <p>
                        ${product.category || ""}
                    </p>

                </div>
            `).join("")
            ||
            "<p>Nessun risultato trovato.</p>"
        }
    `;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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
  src="https://player.cloudinary.com/embed/?cloud_name=w7sxjd36&public_id=Heads_GHW"
  width="640"
  height="360" 
  style="height: auto; width: 100%; aspect-ratio: 640 / 360;"
  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
  allowfullscreen
  frameborder="0"
></iframe>
            </div>
        `;
    }

    if (/^https:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?$/i.test(videoUrl)) {
        return `
            <video
                class="product-video"
                controls
                playsinline
                preload="metadata"
                style="width:100%;"
                src="${videoUrl}"
            ></video>
        `;
    }

    return "";
}

