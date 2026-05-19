import { Box, CircularProgress, Paper, Typography } from "@mui/material";

export default function LoadingState({ message = "Carregando..." }) {
  return (
    <Paper
      sx={{
        minHeight: 220,
        borderRadius: "18px",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 18px rgba(255,255,255,0.05)"
            : "0 4px 18px rgba(15, 23, 42, 0.05)",
        display: "grid",
        placeItems: "center",
        p: 4,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    </Paper>
  );
}