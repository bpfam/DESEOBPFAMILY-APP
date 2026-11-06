
let cart = JSON.parse(localStorage.getItem("bpfam_cart")) || [];
let currentCategory = "ALL";

/* =====================================
   NAVIGAZIONE
===================================== */

function showPage(pageId) {
  const pages = document.querySelectorAll(".page-section");

  pages.forEach(page => {
    page.classList.add("hidden");
  });

  const targetPage = document.getElementById(pageId);

  if (targetPage) {
    targetPage.classList.remove("hidden");
    window.scrollTo(0, 0);
  }
}

/* =====================================
   ACCESSO MAGGIORENNI
===================================== */

function enterSite() {
  const age = document.getElementById("ageCheck")?.checked;
  const terms = document.getElementById("termsCheck")?.checked;

  if (!age || !terms) {
    alert("Devi confermare età e termini per accedere.");
    return;
  }

  localStorage.setItem("bpfam_access", "yes");

  const ageGate = document.getElementById("ageGate");

  if (ageGate) {
    ageGate.style.display = "none";
  }

  playIntro();
}

/* ACCESSO GIÀ CONFERMATO */

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("bpfam_access") === "yes") {
    const ageGate = document.getElementById("ageGate");
    const site = document.getElementById("siteContent");

    if (ageGate) {
      ageGate.style.display = "none";
    }

    if (site) {
      site.classList.remove("hidden");
    }

    showPage("homePage");
  }
});

/* =====================================
   VIDEO INTRO BPFAM
===================================== */

let introFinished = false;

function playIntro() {
  const overlay = document.getElementById("introOverlay");
  const video = document.getElementById("introVideo");

  introFinished = false;

  if (!overlay || !video) {
    finishIntro();
    return;
  }

  overlay.classList.remove("hidden");

  video.muted = true;
  video.currentTime = 0;
  video.load();

  const playback = video.play();

  if (playback && typeof playback.catch === "function") {
    playback.catch(error => {
      console.warn("Video intro non avviato:", error);
    });
  }
}

/* APERTURA AUTOMATICA HOME */

function finishIntro() {
  if (introFinished) return;

  introFinished = true;

  const overlay = document.getElementById("introOverlay");
  const video = document.getElementById("introVideo");
  const site = document.getElementById("siteContent");

  if (video) {
    video.pause();
  }

  if (overlay) {
    overlay.classList.add("hidden");
  }

  if (site) {
    site.classList.remove("hidden");
  }

  showPage("homePage");
}

/* =====================================
   CARICAMENTO PRODOTTI
===================================== */

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error("Impossibile caricare products.json");
    }

    const products = await response.json();

    window.productsData = products;

    renderCategories(products);
    renderProducts(products);
  } catch (error) {
    console.error("Errore prodotti:", error);

    const container = document.getElementById("products");

    if (container) {
      container.innerHTML =
        "<p>Impossibile caricare gli articoli.</p>";
    }
  }
}

function renderCategories(products) {
  const categoriesBox = document.getElementById("categories");

  if (!categoriesBox) return;

  const categories = [
    "ALL",
    ...new Set(products.map(product => product.category))
  ];

  categoriesBox.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");

    button.textContent =
      category === "ALL" ? "TUTTI" : category;

    button.addEventListener("click", () => {
      filterCategory(category);
    });

    categoriesBox.appendChild(button);
  });
}

function filterCategory(category) {
  currentCategory = category;
  renderProducts(window.productsData || []);
}

/* =====================================
   VETRINA CON PULSANTE VIDEO
===================================== */

function variantLabel(variant) {
  return variant.label ?? variant.size ?? "Formato unico";
}

function renderProducts(products) {
  const container = document.getElementById("products");

  if (!container) return;

  container.innerHTML = "";

  let filteredProducts = products;

  if (currentCategory !== "ALL") {
    filteredProducts = products.filter(
      product => product.category === currentCategory
    );
  }

  filteredProducts.forEach(product => {
    const realIndex = window.productsData.indexOf(product);

    if (!product.variants || product.variants.length === 0) {
      return;
    }

    const firstVariant = product.variants[0];
    const lastVariant =
      product.variants[product.variants.length - 1];

    container.innerHTML += `
      <div class="product-card premium-product">

        <div class="product-image-wrap">
          <span class="category-badge">
            ${product.category || "Categoria"}
          </span>

          <img
            src="${product.image || ""}"
            alt="${product.name || "Articolo"}"
            loading="lazy"
          >
        </div>

        <div class="product-info">

          <h3>${product.name}</h3>

          <span class="product-status">
            ${product.status || "Stato non indicato"}
          </span>

          <div class="price-row">
            <span>Da €${firstVariant.price}</span>
            <small>
              fino a ${variantLabel(lastVariant)}
            </small>
          </div>

          <label>Formato disponibile</label>

          <select
            id="variant-${realIndex}"
            onchange="updateTotal(${realIndex})"
          >
            ${product.variants.map((variant, i) => `
              <option value="${i}">
                ${variantLabel(variant)} - €${variant.price}
              </option>
            `).join("")}
          </select>

          <div class="mini-total">
            <p id="price-${realIndex}">
              Prezzo: €${firstVariant.price}
            </p>

            <p id="total-${realIndex}">
              Totale: €${firstVariant.price}
            </p>
          </div>

          <div class="qty-box">

            <button
              type="button"
              onclick="changeQty(${realIndex}, -1)"
            >
              -
            </button>

            <span id="qty-${realIndex}">1</span>

            <button
              type="button"
              onclick="changeQty(${realIndex}, 1)"
            >
              +
            </button>

          </div>

          <button
            type="button"
            class="add-cart-btn"
            onclick="addToCart(${realIndex})"
          >
            AGGIUNGI AL CARRELLO
          </button>

          <a
            href="https://bpfam.github.io/Video-bpfam/"
            class="video-gallery-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            🎬 CLICCA QUI PER I VIDEO
          </a>

        </div>

      </div>
    `;
  });

  if (filteredProducts.length === 0) {
    container.innerHTML =
      "<p>Nessun articolo disponibile.</p>";
  }
}

/* =====================================
   VARIANTI E PREZZI
===================================== */

function getVariant(index) {
  const variantSelect =
    document.getElementById(`variant-${index}`);

  if (!variantSelect) return null;

  const variantIndex = Number(variantSelect.value);

  return window.productsData[index].variants[variantIndex];
}

function updateTotal(index) {
  const variant = getVariant(index);

  if (!variant) return;

  const qtyEl = document.getElementById(`qty-${index}`);
  const priceEl = document.getElementById(`price-${index}`);
  const totalEl = document.getElementById(`total-${index}`);

  if (!qtyEl || !priceEl || !totalEl) return;

  const qty = parseInt(qtyEl.innerText, 10);
  const total = Number(variant.price) * qty;

  priceEl.innerText = `Prezzo: €${variant.price}`;
  totalEl.innerText = `Totale: €${total}`;
}

function changeQty(index, amount) {
  const qtyEl = document.getElementById(`qty-${index}`);

  if (!qtyEl) return;

  let qty = parseInt(qtyEl.innerText, 10);

  qty += amount;

  if (qty < 1) qty = 1;

  qtyEl.innerText = qty;

  updateTotal(index);
}

/* =====================================
   CARRELLO
===================================== */

function addToCart(index) {
  const product = window.productsData[index];
  const variant = getVariant(index);
  const qtyEl = document.getElementById(`qty-${index}`);

  if (!product || !variant || !qtyEl) return;

  const qty = parseInt(qtyEl.innerText, 10);
  const total = Number(variant.price) * qty;

  cart.push({
    name: product.name,
    size: variantLabel(variant),
    qty,
    total
  });

  renderCart();

  alert("✅ Aggiunto al carrello!");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";

  let finalTotal = 0;

  cart.forEach((item, index) => {
    finalTotal += Number(item.total);

    cartItems.innerHTML += `
      <div class="cart-item">

        <span>
          ${item.name} • ${item.size} •
          x${item.qty} = €${item.total}
        </span>

        <button
          type="button"
          class="remove-btn"
          onclick="removeFromCart(${index})"
        >
          Rimuovi
        </button>

      </div>
    `;
  });

  localStorage.setItem(
    "bpfam_cart",
    JSON.stringify(cart)
  );

  cartTotal.innerText =
    `Totale finale: €${finalTotal}`;
}

/* =====================================
   CAMPI DINAMICI
===================================== */

function showOrderFields() {
  const method = document.getElementById("orderMethod")?.value;
  const box = document.getElementById("dynamicFields");

  if (!box) return;

  if (method === "Incontro di Persona") {
    box.innerHTML = `
      <input id="customerName" placeholder="Nome">
      <input id="customerContact" placeholder="Telegram o Signal">
      <input id="customerCity" placeholder="Città">
      <input id="customerZone" placeholder="Zona">
      <input id="customerDate" placeholder="Data preferita">
      <input id="customerTime" placeholder="Orario preferito">
    `;
  }

  else if (method === "Delivery") {
    box.innerHTML = `
      <input id="customerName" placeholder="Nome">
      <input id="customerPhone" placeholder="Telefono">
      <input id="customerCity" placeholder="Città">
      <input id="customerAddress" placeholder="Indirizzo / punto consegna">
      <input id="customerDate" placeholder="Data preferita">
      <input id="customerTime" placeholder="Orario preferito">
    `;
  }

  else if (method === "Spedizione") {
    box.innerHTML = `
      <input id="customerName" placeholder="Nome">
      <input id="customerEmail" placeholder="Email">
      <input id="customerPhone" placeholder="Telefono">
      <input id="customerAddress" placeholder="Indirizzo">
      <input id="customerCity" placeholder="Città">
      <input id="customerZip" placeholder="CAP">

      <select id="shippingCourier">
        <option value="">Seleziona corriere</option>
        <option value="UPS">UPS</option>
        <option value="InPost">InPost</option>
        <option value="Bartolini">Bartolini</option>
        <option value="Poste Italiane">Poste Italiane</option>
        <option value="Altro">Altro</option>
      </select>
    `;
  }

  else {
    box.innerHTML = "";
  }
}

/* =====================================
   RIEPILOGO ORDINE
===================================== */

function buildOrderMessage() {
  if (cart.length === 0) {
    alert("Il carrello è vuoto.");
    return null;
  }

  const orderId =
    Math.floor(100000 + Math.random() * 900000);

  const method =
    document.getElementById("orderMethod")?.value;

  const payment =
    document.getElementById("paymentMethod")?.value;

  const notes =
    document.getElementById("orderNotes")?.value || "";

  if (!method || !payment) {
    alert("Seleziona metodo ordine e metodo pagamento.");
    return null;
  }

  let message = `ORDINE BPFAM #${orderId}\n\nPRODOTTI:\n`;

  let finalTotal = 0;

  cart.forEach(item => {
    finalTotal += Number(item.total);

    message +=
      `- ${item.name} • ${item.size} • x${item.qty} = €${item.total}\n`;
  });

  message += `\nTOTALE: €${finalTotal}\n`;
  message += `METODO ORDINE: ${method}\n`;
  message += `PAGAMENTO: ${payment}\n\n`;

  const fields = document.querySelectorAll(
    "#dynamicFields input, #dynamicFields select"
  );

  fields.forEach(field => {
    if (field.value) {
      message +=
        `${field.placeholder || "Corriere"}: ${field.value}\n`;
    }
  });

  if (notes) {
    message += `Note: ${notes}\n`;
  }

  return message;
}

function copyOrder() {
  const message = buildOrderMessage();

  if (!message) return;

  navigator.clipboard.writeText(message)
    .then(() => {
      alert("Ordine copiato.");
    })
    .catch(() => {
      alert("Impossibile copiare automaticamente l'ordine.");
    });
}

function checkoutTelegram() {
  const message = buildOrderMessage();

  if (!message) return;

  navigator.clipboard.writeText(message)
    .then(() => {
      alert(
        "Ordine copiato. Incollalo nella chat Telegram BPFAM."
      );

      window.location.href =
        "https://t.me/BPFAMPRIVATE_CLUB";
    })
    .catch(() => {
      alert("Impossibile copiare l'ordine.");
    });
}

function checkoutSignal() {
  const message = buildOrderMessage();

  if (!message) return;

  navigator.clipboard.writeText(message)
    .then(() => {
      alert(
        "Ordine copiato. Incollalo nella chat Signal."
      );

      window.location.href =
        "https://signal.me/#eu/oVw4zH1o2XV7hvoOVNnpQYfUIsUIVJZ-yVfherXcauUzT_aecLxDzL2g7fJsIsxZ";
    })
    .catch(() => {
      alert("Impossibile copiare l'ordine.");
    });
}

/* =====================================
   NEWS
===================================== */

async function loadNews() {
  try {
    const response = await fetch("data/news.json");

    if (!response.ok) {
      throw new Error("File news non disponibile");
    }

    const news = await response.json();

    const container =
      document.getElementById("newsContainer");

    if (!container) return;

    container.innerHTML = "";

    news.forEach(item => {
      container.innerHTML += `
        <div class="product-card">
          <img src="${item.image}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <p>${item.date}</p>
        </div>
      `;
    });

  } catch (error) {
    console.log("News:", error);
  }
}

/* =====================================
   AVVIO
===================================== */

window.addEventListener("DOMContentLoaded", () => {
  renderCart();
  loadProducts();
  loadNews();
});
