import { Box, Button, Stack, Typography } from "@mui/material";

export default function AppPageHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
}) {
  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        borderBottom: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(79,70,229,0.04) 0%, rgba(79,70,229,0.00) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary", mb: 0.5 }}>
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
              px: 2.4,
              py: 1.1,
              fontWeight: 800,
            }}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}