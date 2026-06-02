import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Chip, IconButton, MenuItem, Tooltip, Typography } from "@mui/material";;
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppTextField from "../../components/common/AppTextField";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateSenhaUsuario,
  updateUsuario,
} from "../../services/api";

const INITIAL_FORM = {
  nome: "",
  email: "",
  senha: "",
  role: "VENDEDOR",
};

function normalizeUsuario(item) {
  return {
    id: item?.id || "",
    nome: item?.nome || "",
    email: item?.email || "",
    role: item?.role || "VENDEDOR",
  };
}

function getRoleLabel(role) {
  if (role === "ADMIN") return "Administrador";
  if (role === "COLORISTA") return "Colorista";
  if (role === "VENDEDOR") return "Vendedor";
  return role || "-";
}

function getRoleStyles(role) {
  if (role === "ADMIN") {
    return {
      backgroundColor: "primary.main",
      borderColor: "primary.main",
    };
  }

  if (role === "COLORISTA") {
    return {
      backgroundColor: "info.main",
      borderColor: "info.main",
    };
  }

  return {
    backgroundColor: "success.main",
    borderColor: "success.main",
  };
}

export default function UsersPage() {
  const { showSnackbar } = useAppSnackbar();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordTargetEmail, setPasswordTargetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadUsuarios() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data.map(normalizeUsuario) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuarios = useMemo(() => {
    const term = search.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const matchesSearch =
        !term ||
        usuario.nome.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "TODOS" || usuario.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usuarios, search, roleFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function openCreateDialog() {
    setEditingEmail("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(usuario) {
    setEditingEmail(usuario.email);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      role: usuario.role,
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingEmail("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function validateForm() {
    const errors = {};
    if (!String(form.nome).trim()) errors.nome = "Informe o nome.";
    if (!String(form.email).trim()) errors.email = "Informe o e-mail.";
    if (!editingEmail && !String(form.senha).trim()) {
      errors.senha = "Informe a senha.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      if (editingEmail) {
        await updateUsuario(editingEmail, {
          nome: form.nome,
          email: form.email,
          role: form.role,
        });
        showSnackbar("Usuário atualizado com sucesso.", "success");
      } else {
        await createUsuario({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          role: form.role,
        });
        showSnackbar("Usuário cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadUsuarios();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(usuario) {
    try {
      await deleteUsuario(usuario.email);
      showSnackbar("Usuário removido com sucesso.", "success");
      await loadUsuarios();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleChangePassword() {
  if (!editingEmail) {
    showSnackbar("Selecione um usuário para alterar a senha.", "error");
    return;
  }

  if (!String(form.senha).trim()) {
    setFieldErrors((prev) => ({
      ...prev,
      senha: "Informe a nova senha.",
    }));
    return;
  }

  setSaving(true);

  try {
    await updateSenhaUsuario(editingEmail, {
      senha: form.senha,
    });

    showSnackbar("Senha alterada com sucesso.", "success");
    setForm((prev) => ({ ...prev, senha: "" }));
    setFieldErrors((prev) => ({ ...prev, senha: "" }));
  } catch (error) {
    showSnackbar(getProblemDetailMessage(error), "error");
  } finally {
    setSaving(false);
  }
}

function openPasswordDialog(usuario) {
  setPasswordTargetEmail(usuario.email);
  setNewPassword("");
  setPasswordError("");
  setPasswordDialogOpen(true);
}

function closePasswordDialog() {
  if (saving) return;
  setPasswordDialogOpen(false);
  setPasswordTargetEmail("");
  setNewPassword("");
  setPasswordError("");
}

async function handleSubmitPassword(event) {
  event.preventDefault();

  if (!String(newPassword).trim()) {
    setPasswordError("Informe a nova senha.");
    return;
  }

  setSaving(true);

  try {
    await updateSenhaUsuario(passwordTargetEmail, {
      senha: newPassword,
    });

    showSnackbar("Senha alterada com sucesso.", "success");
    closePasswordDialog();
  } catch (error) {
    setPasswordError(getProblemDetailMessage(error));
  } finally {
    setSaving(false);
  }
}

  const columns = [
    {
      key: "usuario",
      label: "Usuário",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.nome}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: "role",
      label: "Perfil",
      render: (row) => {
        const styles = getRoleStyles(row.role);

        return (
          <Chip
            label={getRoleLabel(row.role)}
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: styles.backgroundColor,
              border: "1px solid",
              borderColor: styles.borderColor,
            }}
          />
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Editar usuário" arrow>
            <IconButton onClick={() => openEditDialog(row)}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>

           <Box
            onClick={() => openPasswordDialog(row)}
            sx={{
              px: 1.4,
              py: 0.7,
              minWidth: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: "999px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              color: "#D97706",
              fontSize: 12.5,
              fontWeight: 800,
              lineHeight: 1,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(245, 158, 11, 0.22)",
                color: "#B45309",
              },
            }}
          >
            Alterar senha
          </Box>

          <Tooltip title="Excluir usuário" arrow>
            <IconButton color="error" onClick={() => handleDelete(row)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Box
        sx={{
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <AppPageHeader
          title="Usuários"
          subtitle="Gerencie os acessos e perfis do sistema."
          actionLabel="Novo usuário"
          actionIcon={<AddIcon />}
          onAction={openCreateDialog}
        />

        <Box sx={{ px: 3, pb: 2, display: "grid", gap: 2 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
              gap: 2,
              alignItems: "start",
              pt: 1.5,
            }}
          >
            <AppTextField
              placeholder="Buscar por nome ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            />

            <AppTextField
              select
              label="Perfil"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="COLORISTA">Colorista</MenuItem>
              <MenuItem value="VENDEDOR">Vendedor</MenuItem>
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando usuários..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredUsuarios}
            emptyMessage="Nenhum usuário encontrado."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingEmail ? "Editar usuário" : "Novo usuário"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingEmail ? "Salvar alterações" : "Cadastrar usuário"}
      >
        <AppTextField
          required
          name="nome"
          label="Nome"
          value={form.nome}
          onChange={handleChange}
          error={Boolean(fieldErrors.nome)}
          helperText={fieldErrors.nome}
        />

        <AppTextField
          required
          name="email"
          label="E-mail"
          value={form.email}
          onChange={handleChange}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
        />

        {!editingEmail ? (
          <AppTextField
            required
            name="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            error={Boolean(fieldErrors.senha)}
            helperText={fieldErrors.senha}
          />
        ) : null}

        <AppFormDialog
          open={passwordDialogOpen}
          title="Alterar senha"
          onClose={closePasswordDialog}
          onSubmit={handleSubmitPassword}
          loading={saving}
          submitLabel="Salvar nova senha"
        >
          <AppTextField
            required
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setPasswordError("");
            }}
            error={Boolean(passwordError)}
            helperText={passwordError}
          />
        </AppFormDialog>

        <AppTextField
          select
          required
          name="role"
          label="Perfil"
          value={form.role}
          onChange={handleChange}
        >
          <MenuItem value="ADMIN">Administrador</MenuItem>
          <MenuItem value="COLORISTA">Colorista</MenuItem>
          <MenuItem value="VENDEDOR">Vendedor</MenuItem>
        </AppTextField>
      </AppFormDialog>
    </AdminLayout>
  );
}