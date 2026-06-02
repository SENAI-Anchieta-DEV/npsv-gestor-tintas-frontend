import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
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
  createCliente,
  deleteCliente,
  desativarCliente,
  getClientes,
  updateCliente,
} from "../../services/api";

const INITIAL_FORM = {
  id: "",
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
  ativo: true,
};

function normalizeCliente(item) {
  return {
    id: item?.id || "",
    nome: item?.nome || "",
    cpf: item?.cpf || "",
    telefone: item?.telefone || "",
    email: item?.email || "",
    endereco: item?.endereco || "",
    ativo: Boolean(item?.ativo),
  };
}

function formatCpf(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return value || "-";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
}

function normalizeCpfValue(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatTelefone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return value || "-";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return digits.replace(/(\d{2})(\d+)/, "($1) $2");
  const normalized = digits.slice(0, 11);
  return normalized.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function normalizeTelefoneValue(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function ClientsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadClientes() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data.map(normalizeCliente) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const matchesSearch =
        !term ||
        cliente.nome.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        cliente.cpf.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODOS" ||
        (statusFilter === "ATIVOS" && cliente.ativo) ||
        (statusFilter === "INATIVOS" && !cliente.ativo);

      return matchesSearch && matchesStatus;
    });
  }, [clientes, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "cpf"
        ? formatCpf(value)
        : name === "telefone"
        ? formatTelefone(value)
        : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function openCreateDialog() {
    setEditingId("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(cliente) {
    setEditingId(cliente.id);
    setForm({
      id: cliente.id,
      nome: cliente.nome,
      cpf: formatCpf(cliente.cpf),
      telefone: cliente.telefone,
      email: cliente.email,
      endereco: cliente.endereco,
      ativo: cliente.ativo,
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingId("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function validateForm() {
    const errors = {};

    if (!String(form.nome).trim()) errors.nome = "Informe o nome.";
    if (!String(form.cpf).trim()) errors.cpf = "Informe o CPF.";
    if (!String(form.telefone).trim()) errors.telefone = "Informe o telefone.";
    if (!String(form.email).trim()) errors.email = "Informe o e-mail.";
    if (!String(form.endereco).trim()) errors.endereco = "Informe o endereço.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      nome: form.nome,
      cpf: normalizeCpfValue(form.cpf),
      telefone: normalizeTelefoneValue(form.telefone),
      email: form.email,
      endereco: form.endereco,
    };

    try {
      if (editingId) {
        await updateCliente(editingId, payload);
        showSnackbar("Cliente atualizado com sucesso.", "success");
      } else {
        await createCliente(payload);
        showSnackbar("Cliente cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadClientes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cliente) {
    try {
      await deleteCliente(cliente.id);
      showSnackbar("Cliente removido com sucesso.", "success");
      await loadClientes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleDeactivate(cliente) {
    try {
      await desativarCliente(cliente.id);
      showSnackbar("Cliente desativado com sucesso.", "success");
      await loadClientes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "cliente",
      label: "Cliente",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.nome}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.email || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "cpf",
      label: "CPF",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {formatCpf(row.cpf)}
        </Typography>
      ),
    },
    {
      key: "telefone",
      label: "Telefone",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {formatTelefone(row.telefone)}
        </Typography>
      ),
    },
    {
      key: "endereco",
      label: "Endereço",
      render: (row) => (
        <Typography sx={{ color: "text.secondary" }}>
          {row.endereco || "-"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.ativo ? "Ativo" : "Inativo"}
          sx={{
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: row.ativo ? "success.main" : "text.secondary",
            border: "1px solid",
            borderColor: row.ativo ? "success.main" : "text.secondary",
          }}
        />
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => openEditDialog(row)}>
            <EditOutlinedIcon />
          </IconButton>

          {row.ativo ? (
            <Button
              size="small"
              onClick={() => handleDeactivate(row)}
              sx={{
                minWidth: "auto",
                px: 1.4,
                color: "#FFFFFF",
                backgroundColor: "#F59E0B",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "#D97706",
                },
              }}
            >
              Desativar
            </Button>
          ) : null}

          <IconButton color="error" onClick={() => handleDelete(row)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
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
          title="Clientes"
          subtitle="Gerencie os clientes cadastrados no sistema."
          actionLabel="Novo cliente"
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
              placeholder="Buscar por nome, e-mail ou CPF"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            />

            <AppTextField
              select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="ATIVOS">Ativos</MenuItem>
              <MenuItem value="INATIVOS">Inativos</MenuItem>
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando clientes..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredClientes}
            emptyMessage="Nenhum cliente encontrado."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingId ? "Editar cliente" : "Novo cliente"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingId ? "Salvar alterações" : "Cadastrar cliente"}
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
          name="cpf"
          label="CPF"
          value={form.cpf}
          onChange={handleChange}
          error={Boolean(fieldErrors.cpf)}
          helperText={fieldErrors.cpf}
        />

        <AppTextField
          required
          name="telefone"
          label="Telefone"
          value={form.telefone}
          onChange={handleChange}
          error={Boolean(fieldErrors.telefone)}
          helperText={fieldErrors.telefone}
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

        <AppTextField
          required
          name="endereco"
          label="Endereço"
          value={form.endereco}
          onChange={handleChange}
          error={Boolean(fieldErrors.endereco)}
          helperText={fieldErrors.endereco}
        />
      </AppFormDialog>
    </AdminLayout>
  );
}