import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "../../services/api";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "COLORISTA", label: "Colorista" },
  { value: "VENDEDOR", label: "Vendedor" },
];

const initialForm = {
  nome: "",
  email: "",
  senha: "",
  role: "VENDEDOR",
};

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errorState, setErrorState] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  async function loadUsers() {
    setLoading(true);
    setErrorState("");

    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorState(error.message || "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;

    return usuarios.filter((u) =>
      [u.nome, u.email, u.role].some((value) =>
        String(value || "").toLowerCase().includes(q)
      )
    );
  }, [usuarios, search]);

  function openCreate() {
    setEditingUser(null);
    setForm(initialForm);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      nome: user.nome || "",
      email: user.email || "",
      senha: "",
      role: user.role || "VENDEDOR",
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.nome.trim()) errors.nome = "Informe o nome.";
    if (!form.email.trim()) errors.email = "Informe o e-mail.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "E-mail inválido.";
    if (!editingUser && !form.senha.trim()) errors.senha = "Informe a senha.";
    if (!form.role) errors.role = "Selecione o perfil.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Revise os campos obrigatórios.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        role: form.role,
        ...(form.senha.trim() ? { senha: form.senha.trim() } : {}),
      };

      if (editingUser) {
        await updateUsuario(editingUser.email, payload);
      } else {
        await createUsuario(payload);
      }

      setSnackbar({
        open: true,
        severity: "success",
        message: editingUser
          ? "Usuário atualizado com sucesso."
          : "Usuário cadastrado com sucesso.",
      });

      closeDialog();
      await loadUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Não foi possível salvar o usuário.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const ok = window.confirm(`Deseja inativar o usuário "${user.nome}"?`);
    if (!ok) return;

    try {
      await deleteUsuario(user.email);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Usuário inativado com sucesso.",
      });
      await loadUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Erro ao inativar usuário.",
      });
    }
  }

  function roleChip(role) {
    const map = {
      ADMIN: { label: "Administrador", color: "error" },
      COLORISTA: { label: "Colorista", color: "primary" },
      VENDEDOR: { label: "Vendedor", color: "success" },
    };

    const item = map[role] || { label: role, color: "default" };
    return <Chip label={item.label} color={item.color} size="small" />;
  }

  return (
    <AdminLayout title="Sistema de Gestão de Tintas">
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5">Gerenciar usuários</Typography>
            <Typography color="text.secondary">
              Listar, cadastrar, editar e inativar contas por perfil.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadUsers}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
            >
              Novo usuário
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por nome, e-mail ou perfil"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">Carregando usuários...</Typography>
            </Stack>
          </Box>
        ) : errorState ? (
          <Alert severity="error" action={<Button onClick={loadUsers}>Tentar novamente</Button>}>
            {errorState}
          </Alert>
        ) : filteredUsers.length === 0 ? (
          <Alert severity="info" action={<Button onClick={openCreate}>Novo usuário</Button>}>
            Nenhum usuário encontrado. Clique em “Novo usuário” para iniciar.
          </Alert>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>E-mail</strong></TableCell>
                  <TableCell><strong>Perfil</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.email} hover>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleChip(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.ativo ? "Ativo" : "Inativo"}
                        color={user.ativo ? "success" : "default"}
                        size="small"
                        variant={user.ativo ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEdit(user)}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user)}>
                        <DeleteOutlineOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingUser ? "Editar usuário" : "Cadastrar usuário"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                error={Boolean(fieldErrors.nome)}
                helperText={fieldErrors.nome}
                fullWidth
              />

              <TextField
                label="E-mail"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                disabled={Boolean(editingUser)}
                fullWidth
              />

              <TextField
                label={editingUser ? "Nova senha (opcional)" : "Senha"}
                name="senha"
                type="password"
                value={form.senha}
                onChange={handleChange}
                error={Boolean(fieldErrors.senha)}
                helperText={fieldErrors.senha}
                fullWidth
              />

              <TextField
                select
                label="Perfil"
                name="role"
                value={form.role}
                onChange={handleChange}
                error={Boolean(fieldErrors.role)}
                helperText={fieldErrors.role}
                fullWidth
              >
                {ROLE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : editingUser ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}