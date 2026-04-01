import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";

export default function AppFormDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  children,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {children}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
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
