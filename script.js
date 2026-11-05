let cart = JSON.parse(localStorage.getItem("bpfam_cart")) || [];
let currentCategory = "ALL";

function showPage(pageId){
  const pages = document.querySelectorAll(".page-section");

  pages.forEach(page => {
    page.classList.add("hidden");
  });

  const targetPage = document.getElementById(pageId);

  if(targetPage){
    targetPage.classList.remove("hidden");
    window.scrollTo(0, 0);
  }
}

function enterSite(){
  const age = document.getElementById("ageCheck").checked;
  const terms = document.getElementById("termsCheck").checked;

  if(!age || !terms){
    alert("Devi confermare età e termini per accedere.");
    return;
  }

  localStorage.setItem("bpfam_access", "yes");
  document.getElementById("ageGate").style.display = "none";
  document.getElementById("siteContent").classList.remove("hidden");
  showPage("homePage");
}

if(localStorage.getItem("bpfam_access") === "yes"){
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("ageGate").style.display = "none";
    document.getElementById("siteContent").classList.remove("hidden");
    showPage("homePage");
  });
}

async function loadProducts(){
  const response = await fetch("data/products.json");
  const products = await response.json();

  window.productsData = products;

  renderCategories(products);
  renderProducts(products);
}

function renderCategories(products){
  const categoriesBox = document.getElementById("categories");

  const categories = [
    "ALL",
    ...new Set(products.map(product => product.category))
  ];

  categoriesBox.innerHTML = "";

  categories.forEach(category => {
    categoriesBox.innerHTML += `
      <button onclick="filterCategory('${category}')">${category}</button>
    `;
  });
}

function filterCategory(category){
  currentCategory = category;
  renderProducts(window.productsData);
}

function renderProducts(products){
  const container = document.getElementById("products");
  container.innerHTML = "";

  let filteredProducts = products;

  if(currentCategory !== "ALL"){
    filteredProducts = products.filter(product => product.category === currentCategory);
  }

  filteredProducts.forEach(product => {
    const realIndex = window.productsData.indexOf(product);
    const firstVariant = product.variants[0];
    const lastVariant = product.variants[product.variants.length - 1];

    container.innerHTML += `
      <div class="product-card premium-product">

        <div class="product-image-wrap">
          <span class="category-badge">${product.category}</span>
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>

          <div class="price-row">
            <span>Da €${firstVariant.price}</span>
            <small>fino a ${lastVariant.size}</small>
          </div>

          <label>Formato disponibile</label>

          <select id="variant-${realIndex}" onchange="updateTotal(${realIndex})">
            ${product.variants.map((variant, i) => `
              <option value="${i}">${variant.size} - €${variant.price}</option>
            `).join("")}
          </select>

          <div class="mini-total">
            <p id="price-${realIndex}">Prezzo: €${firstVariant.price}</p>
            <p id="total-${realIndex}">Totale: €${firstVariant.price}</p>
          </div>

          <div class="qty-box">
            <button onclick="changeQty(${realIndex}, -1)">-</button>
            <span id="qty-${realIndex}">1</span>
            <button onclick="changeQty(${realIndex}, 1)">+</button>
          </div>

          <button class="add-cart-btn" onclick="addToCart(${realIndex})">
            AGGIUNGI AL CARRELLO
          </button>
        </div>

      </div>
    `;
  });
}

function getVariant(index){
  const variantIndex = document.getElementById(`variant-${index}`).value;
  return window.productsData[index].variants[variantIndex];
}

function updateTotal(index){
  const variant = getVariant(index);
  const qty = parseInt(document.getElementById(`qty-${index}`).innerText);
  const total = variant.price * qty;

  document.getElementById(`price-${index}`).innerText = `Prezzo: €${variant.price}`;
  document.getElementById(`total-${index}`).innerText = `Totale: €${total}`;
}

function changeQty(index, amount){
  const qtyEl = document.getElementById(`qty-${index}`);
  let qty = parseInt(qtyEl.innerText);

  qty += amount;
  if(qty < 1) qty = 1;

  qtyEl.innerText = qty;
  updateTotal(index);
}

function addToCart(index){
  const product = window.productsData[index];
  const variant = getVariant(index);
  const qty = parseInt(document.getElementById(`qty-${index}`).innerText);
  const total = variant.price * qty;

  cart.push({
    name: product.name,
    size: variant.size,
    qty,
    total
  });

  renderCart();
}

function removeFromCart(index){
  cart.splice(index, 1);
  renderCart();
}

function renderCart(){
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartItems.innerHTML = "";

  let finalTotal = 0;

  cart.forEach((item, index) => {
    finalTotal += item.total;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} • ${item.size} • x${item.qty} = €${item.total}</span>
        <button class="remove-btn" onclick="removeFromCart(${index})">Rimuovi</button>
      </div>
    `;
  });

  localStorage.setItem("bpfam_cart", JSON.stringify(cart));
  cartTotal.innerText = `Totale finale: €${finalTotal}`;
}

function showOrderFields(){
  const method = document.getElementById("orderMethod").value;
  const box = document.getElementById("dynamicFields");

  if(method === "Incontro di Persona"){
    box.innerHTML = `
      <input id="customerName" placeholder="Nome">
      <input id="customerContact" placeholder="Telegram o Signal">
      <input id="customerCity" placeholder="Città">
      <input id="customerZone" placeholder="Zona">
      <input id="customerDate" placeholder="Data preferita">
      <input id="customerTime" placeholder="Orario preferito">
    `;
  }

  else if(method === "Delivery"){
    box.innerHTML = `
      <input id="customerName" placeholder="Nome">
      <input id="customerPhone" placeholder="Telefono">
      <input id="customerCity" placeholder="Città">
      <input id="customerAddress" placeholder="Indirizzo / punto consegna">
      <input id="customerDate" placeholder="Data preferita">
      <input id="customerTime" placeholder="Orario preferito">
    `;
  }

  else if(method === "Spedizione"){
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

  else{
    box.innerHTML = "";
  }
}

function buildOrderMessage(){
  if(cart.length === 0){
    alert("Il carrello è vuoto.");
    return null;
  }

  const orderId = Math.floor(100000 + Math.random() * 900000);
  const method = document.getElementById("orderMethod").value;
  const payment = document.getElementById("paymentMethod").value;
  const notes = document.getElementById("orderNotes").value;

  if(!method || !payment){
    alert("Seleziona metodo ordine e metodo pagamento.");
    return null;
  }

  let message = `ORDINE BPFAM #${orderId}\n\nPRODOTTI:\n`;

  let finalTotal = 0;

  cart.forEach(item => {
    finalTotal += item.total;
    message += `- ${item.name} • ${item.size} • x${item.qty} = €${item.total}\n`;
  });

  message += `\nTOTALE: €${finalTotal}\n`;
  message += `METODO ORDINE: ${method}\n`;
  message += `PAGAMENTO: ${payment}\n\n`;

  const fields = document.querySelectorAll("#dynamicFields input, #dynamicFields select");

  fields.forEach(field => {
    if(field.value){
      message += `${field.placeholder || "Corriere"}: ${field.value}\n`;
    }
  });

  if(notes){
    message += `Note: ${notes}\n`;
  }

  return message;
}

function copyOrder(){
  const message = buildOrderMessage();
  if(!message) return;

  navigator.clipboard.writeText(message);
  alert("Ordine copiato.");
}

function checkoutTelegram(){
  const message = buildOrderMessage();
  if(!message) return;

  navigator.clipboard.writeText(message);
  alert("Ordine copiato. Incollalo nella chat Telegram BPFAM.");

  window.location.href = "https://t.me/BPFAMPRIVATE_CLUB";
}

function checkoutSignal(){
  const message = buildOrderMessage();
  if(!message) return;

  navigator.clipboard.writeText(message);
  alert("Ordine copiato. Incollalo nella chat Signal.");

  window.location.href =
    "https://signal.me/#eu/oVw4zH1o2XV7hvoOVNnpQYfUIsUIVJZ-yVfherXcauUzT_aecLxDzL2g7fJsIsxZ";
}

async function loadNews(){
  try{
    const response = await fetch("data/news.json");
    const news = await response.json();

    const container = document.getElementById("newsContainer");

    if(!container) return;

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

  }catch(error){
    console.log(error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderCart();
});

loadProducts();
loadNews();