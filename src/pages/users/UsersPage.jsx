import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "../../services/api";

import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

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
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (!form.email.trim()) {
      errors.email = "Informe o e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!editingUser && !form.senha.trim()) {
      errors.senha = "Informe a senha.";
    }

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
        showSnackbar("Usuário atualizado com sucesso.", "success");
      } else {
        await createUsuario(payload);
        showSnackbar("Usuário cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadUsers();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(`Deseja excluir o usuário "${user.nome}"?`);
    if (!confirmed) return;

    try {
      await deleteUsuario(user.email);
      showSnackbar("Usuário excluído com sucesso.", "success");
      await loadUsers();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "usuario",
      label: "Usuário",
      render: (user, index) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ background: getAvatarColor(index) }}>
            {String(user.nome || "U").charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
              {user.nome || "-"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {user.email || "-"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "perfil",
      label: "Perfil",
      render: (user) => (
        <Chip
          icon={
            user.role === "ADMIN" ? (
              <ShieldOutlinedIcon />
            ) : user.role === "COLORISTA" ? (
              <EngineeringOutlinedIcon />
            ) : (
              <StorefrontOutlinedIcon />
            )
          }
          label={getRoleLabel(user.role)}
          size="small"
          sx={{ ...getRoleChipStyles(user.role), fontWeight: 700 }}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user) => (
        <Chip
          label={user.ativo ? "Ativo" : "Inativo"}
          size="small"
          sx={{ ...getStatusChipStyles(user.ativo), fontWeight: 700 }}
        />
      ),
    },
    {
      key: "cadastro",
      label: "Criado em",
      render: (user) => formatDate(user.dataCriacao || user.criadoEm),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (user) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={() => openEdit(user)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton onClick={() => handleDelete(user)}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

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
        <AppPageHeader
          title="Usuários"
          subtitle="Cadastre, edite e gerencie usuários do sistema"
          actionLabel="Novo Usuário"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <AppSearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou e-mail..."
        />

        {errorMessage ? (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando usuários..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredUsers.map((item) => ({
              ...item,
              key: item.email,
            }))}
            emptyMessage="Nenhum usuário encontrado com os filtros informados."
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingUser ? "Editar usuário" : "Novo usuário"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingUser ? "Salvar alterações" : "Cadastrar usuário"}
      >
        <AppTextField
          name="nome"
          label="Nome"
          required
          value={form.nome}
          onChange={handleChange}
          error={Boolean(fieldErrors.nome)}
          helperText={fieldErrors.nome}
        />

        <AppTextField
          name="email"
          label="E-mail"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
        />

        <AppTextField
          name="senha"
          label={editingUser ? "Nova senha" : "Senha"}
          type="password"
          required={!editingUser}
          value={form.senha}
          onChange={handleChange}
          error={Boolean(fieldErrors.senha)}
          helperText={
            fieldErrors.senha ||
            (editingUser
              ? "Preencha apenas se desejar alterar a senha."
              : " ")
          }
        />

        <AppTextField
          select
          name="role"
          label="Perfil"
          required
          value={form.role}
          onChange={handleChange}
          error={Boolean(fieldErrors.role)}
          helperText={fieldErrors.role}
        >
          {ROLE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </AppTextField>
      </AppFormDialog>
    </AdminLayout>
  );
}