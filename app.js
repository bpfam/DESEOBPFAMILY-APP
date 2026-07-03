console.log("BPFAM App avviata");

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.display = "none";
        }
    }, 2200);
});

function openSection(section){

    const content = document.getElementById("content");

    switch(section){

        case "vetrina":
            content.innerHTML = `
                <h2>📸 Vetrina</h2>
                <p>Catalogo ufficiale BPFAM.</p>

                <div class="category-row">
                    <span class="category-pill">Novità</span>
                    <span class="category-pill">Top</span>
                    <span class="category-pill">Limited</span>
                    <span class="category-pill">VIP</span>
                </div>

                <div class="product-card">
                    <h3>Prodotto 1</h3>
                    <p>Descrizione breve del prodotto.</p>
                    <div class="product-meta">
                        <span>Disponibile</span>
                        <span>Info in chat</span>
                    </div>
                    <a class="contact-btn" href="#">Richiedi info</a>
                </div>

                <div class="product-card">
                    <h3>Prodotto 2</h3>
                    <p>Descrizione breve del prodotto.</p>
                    <div class="product-meta">
                        <span>Disponibile</span>
                        <span>Info in chat</span>
                    </div>
                    <a class="contact-btn" href="#">Richiedi info</a>
                </div>
            `;
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