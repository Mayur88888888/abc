import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Remove loading screen once React is ready
const loadingScreen = document.getElementById("loading-screen");
if (loadingScreen) {
  loadingScreen.style.transition = "opacity 0.3s ease";
  loadingScreen.style.opacity = "0";
  setTimeout(() => loadingScreen.remove(), 300);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
