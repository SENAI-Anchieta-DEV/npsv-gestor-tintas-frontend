import { Box, CircularProgress, Typography } from "@mui/material";

export default function AppLoading({ message = "Carregando...", minHeight = 260 }) {
  return (
    <Box
      sx={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <CircularProgress size={34} />
      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
        {message}
      </Typography>
    </Box>
  );
}
