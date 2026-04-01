import { Box, Button, Stack, Typography } from "@mui/material";

export default function AppPageHeader({ title, subtitle, actionLabel, actionIcon, onAction }) {
  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{subtitle}</Typography>
          ) : null}
        </Box>

        {actionLabel ? (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{
              borderRadius: "14px",
              px: 2.2,
              py: 1.1,
              fontWeight: 700,
              background: "linear-gradient(135deg, #4F46E5, #4338CA)",
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #4338CA, #3730A3)",
              },
            }}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
