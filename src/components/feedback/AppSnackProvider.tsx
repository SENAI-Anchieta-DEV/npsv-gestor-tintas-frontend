import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const AppSnackbarContext = createContext(null);

export function AppSnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({
      open: true,
      severity,
      message,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      showSnackbar,
      hideSnackbar,
    }),
    [showSnackbar, hideSnackbar]
  );

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={hideSnackbar}
          sx={{ borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbar() {
  const context = useContext(AppSnackbarContext);

  if (!context) {
    throw new Error("useAppSnackbar deve ser usado dentro de AppSnackbarProvider");
  }

  return context;
}