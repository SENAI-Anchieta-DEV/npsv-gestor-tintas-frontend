import { alpha, createTheme } from "@mui/material/styles";

export function getAppTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#2E33FF" },
      secondary: { main: "#2B82FF" },
      success: { main: "#16A34A" },
      warning: { main: "#F59E0B" },
      error: { main: "#DC2626" },
      info: { main: "#2563EB" },
      background: {
        default: isDark ? "#0B1120" : "#F4F7FB",
        paper: isDark ? "#111827" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F8FAFC" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      divider: isDark ? "#243041" : "#E2E8F0",
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 800 },
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color .2s ease, color .2s ease",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 10px 28px rgba(0,0,0,0.28)"
                : "0 10px 30px rgba(15,23,42,0.06)",
          }),
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 14,
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #4F46E5, #4338CA)",
            boxShadow: "0 12px 24px rgba(79, 70, 229, 0.22)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 14,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#FFFFFF", 0.03)
                : "#FFFFFF",
          }),
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
          variant: "outlined",
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 22,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#FFFFFF", 0.03)
                : "#F8FAFC",
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
          head: {
            fontWeight: 800,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 12,
          },
        },
      },
    },
  });
}