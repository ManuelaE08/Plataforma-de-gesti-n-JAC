import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TemaProvider } from "./context/TemaContext";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento root");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TemaProvider>
          <App />
        </TemaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
