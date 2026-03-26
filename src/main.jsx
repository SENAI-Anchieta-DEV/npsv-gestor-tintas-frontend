import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AppSnackbarProvider } from "./components/feedback/AppSnackbarProvider";
import theme from "./theme/theme";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppSnackbarProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppSnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);