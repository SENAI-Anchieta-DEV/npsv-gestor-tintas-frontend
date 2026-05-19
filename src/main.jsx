import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AppSnackbarProvider } from "./components/feedback/AppSnackbarProvider";
import { ColorModeContext } from "./context/ColorModeContext";
import { getAppTheme } from "./theme/theme";
import "./styles/global.css";

function Root() {
  const [mode, setMode] = useState(() => localStorage.getItem("app-theme-mode") || "light");

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("app-theme-mode", next);
          return next;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppSnackbarProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </AppSnackbarProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);