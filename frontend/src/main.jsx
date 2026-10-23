import React from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";
import "./styles/customer.css";
import "./styles/responsive.css";
import "./styles/dashboard.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);