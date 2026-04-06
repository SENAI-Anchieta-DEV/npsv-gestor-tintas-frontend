import { alpha, createTheme } from "@mui/material/styles";

export default function createAppTheme(mode = "light") {
  const isDark = mode === "dark";

  const backgroundDefault = isDark ? "#0B1120" : "#F5F7FB";
  const backgroundPaper = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const textPrimary = isDark ? "#F9FAFB" : "#0B1739";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";

  return createTheme({
    palette: {
      mode,
      primary: { main: "#4F46E5" },
      secondary: { main: "#3B82F6" },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: borderColor,
      error: { main: "#EF4444" },
      warning: { main: "#F59E0B" },
      success: { main: "#22C55E" },
    },

    shape: {
      borderRadius: 14,
    },

    typography: {
      fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: backgroundDefault,
            color: textPrimary,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
            fontWeight: 700,
            minHeight: 42,
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255,255,255,0.18)" : "#CBD5E1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4F46E5",
              borderWidth: 2,
            },
          },
          input: {
            color: textPrimary,
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: textSecondary,
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          standardInfo: {
            backgroundColor: isDark ? alpha("#3B82F6", 0.12) : undefined,
            color: textPrimary,
          },
          standardError: {
            backgroundColor: isDark ? alpha("#EF4444", 0.12) : undefined,
            color: textPrimary,
          },
          standardSuccess: {
            backgroundColor: isDark ? alpha("#22C55E", 0.12) : undefined,
            color: textPrimary,
          },
          standardWarning: {
            backgroundColor: isDark ? alpha("#F59E0B", 0.12) : undefined,
            color: textPrimary,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor,
          },
          head: {
            color: textSecondary,
            fontWeight: 700,
          },
        },
      },
    },
  });
}