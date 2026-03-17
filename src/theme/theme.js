import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2E33FF",
    },
    secondary: {
      main: "#2B82FF",
    },
    success: {
      main: "#00C853",
    },
    warning: {
      main: "#FFAB00",
    },
    error: {
      main: "#D50000",
    },
    background: {
      default: "#F4F6FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0B1739",
      secondary: "#6B7280",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

export default theme;