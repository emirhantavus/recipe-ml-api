import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./AppRoutes"; // ✅ sadece AppRoutes import ediyoruz
import "./index.css"; // Tailwind için css dosyası

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRoutes /> {/* ✅ AppRoutes çağırıyoruz */}
  </React.StrictMode>
);
