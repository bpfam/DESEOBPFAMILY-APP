console.log("BPFAM App avviata");

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

// Splash Screen
window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.display = "none";
        }
    }, 2200);
});

// Cambia contenuto della Home
function openSection(section){

    const content = document.getElementById("content");

    switch(section){

        case "vetrina":
            content.innerHTML = `
                <h2> 📸Vetrina</h2>
                <p>Qui verranno mostrati prodotti, categorie e novità.</p>
            `;
        break;

        case "recensioni":
            content.innerHTML = `
                <h2>⭐ Recensioni</h2>
                <p>Qui compariranno foto, video e recensioni dei clienti.</p>
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