import { alpha, createTheme } from "@mui/material/styles";

export function getAppTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#2E33FF" },
      secondary: { main: "#2B82FF" },
      success: { main: "#00C853" },
      warning: { main: "#FFAB00" },
      error: { main: "#D50000" },
      background: {
        default: isDark ? "#0B1120" : "#F4F6FA",
        paper: isDark ? "#111827" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F9FAFB" : "#0B1739",
        secondary: isDark ? "#9CA3AF" : "#6B7280",
      },
      divider: isDark ? "#243041" : "#E5E7EB",
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color .25s ease, color .25s ease",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            boxShadow: theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0,0,0,0.28)"
              : "0 4px 20px rgba(15, 23, 42, 0.06)",
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 14 },
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          variant: "outlined",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 14,
            backgroundColor: theme.palette.mode === "dark"
              ? alpha("#FFFFFF", 0.03)
              : "#FFFFFF",
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark" ? alpha("#FFFFFF", 0.03) : "#F8FAFC",
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
          head: { fontWeight: 800 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  });
}