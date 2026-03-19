import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
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

const INITIAL_FORM = {
  nome: "",
  email: "",
  senha: "",
  role: "VENDEDOR",
};

function getRoleLabel(role) {
  if (role === "ADMIN") return "Administrador";
  if (role === "COLORISTA") return "Colorista";
  if (role === "VENDEDOR") return "Vendedor";
  return role;
}

function getRoleChipStyles(role) {
  if (role === "ADMIN") {
    return {
      color: "#4F46E5",
      backgroundColor: "#EEF2FF",
      border: "1px solid #C7D2FE",
    };
  }

  if (role === "COLORISTA") {
    return {
      color: "#2563EB",
      backgroundColor: "#EFF6FF",
      border: "1px solid #BFDBFE",
    };
  }

  return {
    color: "#D97706",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FDE68A",
  };
}

function getStatusChipStyles(ativo) {
  if (ativo) {
    return {
      color: "#16A34A",
      backgroundColor: "#F0FDF4",
      border: "1px solid #BBF7D0",
    };
  }

  return {
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    border: "1px solid #D1D5DB",
  };
}

function getAvatarColor(index) {
  const colors = [
    "linear-gradient(135deg, #4F46E5, #6366F1)",
    "linear-gradient(135deg, #06B6D4, #22C55E)",
    "linear-gradient(135deg, #F59E0B, #EAB308)",
    "linear-gradient(135deg, #F97316, #FACC15)",
  ];

  return colors[index % colors.length];
}

function formatDate(value) {
  if (!value) return "--/--/----";

  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return value;
  }
}

export default function UsersPage() {
  const { showSnackbar } = useAppSnackbar();

  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return usuarios;

    return usuarios.filter((user) => {
      return (
        String(user.nome || "").toLowerCase().includes(term) ||
        String(user.email || "").toLowerCase().includes(term)
      );
    });
  }, [usuarios, search]);

  function openCreate() {
    setEditingUser(null);
    setForm(INITIAL_FORM);
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
    setForm(INITIAL_FORM);
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
      showSnackbar("Revise os campos obrigatórios.", "error");
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

      showSnackbar(
        editingUser
          ? "Usuário atualizado com sucesso."
          : "Usuário cadastrado com sucesso.",
        "success"
      );

      closeDialog();
      await loadUsers();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(`Deseja inativar o usuário "${user.nome}"?`);
    if (!confirmed) return;

    try {
      await deleteUsuario(user.email);
      showSnackbar("Usuário inativado com sucesso.", "success");
      await loadUsers();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  return (
    <AdminLayout>
      <Paper
        sx={{
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0B1739",
                  mb: 0.5,
                }}
              >
                Gestão de Usuários
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Gerencie usuários e permissões de acesso
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
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
              Novo Usuário
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
              sx: {
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
              },
            }}
          />
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              px: 3,
              py: 4,
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando usuários...
              </Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: 700,
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                >
                  <TableCell>Usuário</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Perfil</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data de Cadastro</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow
                    key={user.email || index}
                    hover
                    sx={{
                      "& td": {
                        borderColor: "#E5E7EB",
                        py: 1.4,
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            fontWeight: 800,
                            background: getAvatarColor(index),
                          }}
                        >
                          {String(user.nome || "?").charAt(0).toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#111827",
                              fontSize: 15,
                            }}
                          >
                            {user.nome}
                          </Typography>
                          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                            {getRoleLabel(user.role)}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        sx={{
                          height: 28,
                          fontWeight: 700,
                          borderRadius: "999px",
                          ...getRoleChipStyles(user.role),
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.ativo ? "Ativo" : "Inativo"}
                        sx={{
                          height: 28,
                          fontWeight: 700,
                          borderRadius: "999px",
                          ...getStatusChipStyles(user.ativo),
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatDate(user.dataCadastro)}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlinedIcon fontSize="small" />}
                          onClick={() => openEdit(user)}
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            color: "#111827",
                            borderColor: "#D1D5DB",
                            fontWeight: 600,
                            px: 1.8,
                            minWidth: "auto",
                          }}
                        >
                          Editar
                        </Button>

                        <IconButton
                          sx={{ color: "#6B7280" }}
                          onClick={() => handleDelete(user)}
                        >
                          <MoreHorizIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {filteredUsers.length} usuários cadastrados
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    borderColor: "#D1D5DB",
                    color: "#111827",
                  }}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    borderColor: "#D1D5DB",
                    color: "#111827",
                  }}
                >
                  Próximo
                </Button>
              </Stack>
            </Box>
          </>
        )}

      </Paper>

      <Paper
        sx={{
          mt: 3,
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "#0B1739",
            mb: 3,
          }}
        >
          Perfis de Acesso
        </Typography>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: "16px",
              borderColor: "#E5E7EB",
              backgroundColor: "#F8FAFF",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <ShieldOutlinedIcon sx={{ color: "#4F46E5" }} />
              <Typography sx={{ fontWeight: 800, color: "#4F46E5", fontSize: 16 }}>
                Administrador
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
              Acesso total ao sistema. Pode gerenciar usuários, produtos,
              fórmulas, estoque e relatórios.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: "16px",
              borderColor: "#E5E7EB",
              backgroundColor: "#F8FBFF",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <EngineeringOutlinedIcon sx={{ color: "#3B82F6" }} />
              <Typography sx={{ fontWeight: 800, color: "#3B82F6", fontSize: 16 }}>
                Colorista
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
              Acesso à Aba da Máquina e histórico de produção. Pode realizar
              misturas de tintas.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: "16px",
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFCF5",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <StorefrontOutlinedIcon sx={{ color: "#F59E0B" }} />
              <Typography sx={{ fontWeight: 800, color: "#F59E0B", fontSize: 16 }}>
                Vendedor
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
              Acesso à consulta de produtos e pré-venda. Pode verificar estoque
              e iniciar vendas.
            </Typography>
          </Paper>
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingUser ? "Editar usuário" : "Novo usuário"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
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
                required
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
                required={!editingUser}
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
                required
                error={Boolean(fieldErrors.role)}
                helperText={fieldErrors.role}
                fullWidth
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
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
    </AdminLayout>
  );
}