import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

export default function AppFormDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  children,
  maxWidth = "sm",
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth={maxWidth}>
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 20 }}>{title}</Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Box
            sx={{
              mt: 1,
              p: 2.2,
              borderRadius: "18px",
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>{children}</Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            {cancelLabel}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}