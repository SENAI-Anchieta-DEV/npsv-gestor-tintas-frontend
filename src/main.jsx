import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AppSnackbarProvider } from "./components/feedback/AppSnackbarProvider";
import { ThemeModeProvider } from "./theme/ThemeModeContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <AppSnackbarProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppSnackbarProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);