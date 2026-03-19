import { Box, Button, Paper, Typography } from "@mui/material";

export default function EmptyState({
  title = "Nenhum dado encontrado",
  description = "Não há informações para exibir no momento.",
  actionLabel,
  onAction,
}) {
  return (
    <Paper
      sx={{
        minHeight: 220,
        borderRadius: "18px",
        border: "1px dashed #CBD5E1",
        boxShadow: "none",
        display: "grid",
        placeItems: "center",
        p: 4,
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 420 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0B1739", mb: 1 }}>
          {title}
        </Typography>

        <Typography sx={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, mb: actionLabel ? 2.5 : 0 }}>
          {description}
        </Typography>

        {actionLabel ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Box>
    </Paper>
  );
}