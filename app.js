console.log("BPFAM App avviata");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}