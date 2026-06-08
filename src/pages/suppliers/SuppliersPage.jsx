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
  createFornecedor,
  deactivateFornecedor,
  deleteFornecedor,
  getFornecedores,
  updateFornecedor,
} from "../../services/api";

const INITIAL_FORM = {
  id: "",
  razaoSocial: "",
  nomeContato: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  ativo: true,
};

function normalizeAtivo(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;

  const normalized = String(value).trim().toLowerCase();
  return ["true", "1", "sim", "s", "yes", "y", "ativo", "ativado"].includes(normalized);
}

function normalizeFornecedor(item) {
  return {
    id: item?.id || "",
    razaoSocial: item?.razaoSocial || "",
    nomeContato: item?.nomeContato || "",
    cnpj: item?.cnpj || "",
    telefone: item?.telefone || "",
    email: item?.email || "",
    endereco: item?.endereco || "",
    ativo: normalizeAtivo(item?.ativo),
  };
}

function formatCnpj(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return value || "-";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, "$1.$2");
  if (digits.length <= 8) return digits.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (digits.length <= 12) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");

  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/,
    "$1.$2.$3/$4-$5"
  );
}

function normalizeCnpjValue(value) {
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

export default function SuppliersPage() {
  const { showSnackbar } = useAppSnackbar();

  const [fornecedores, setFornecedores] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadFornecedores() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getFornecedores();
      setFornecedores(Array.isArray(data) ? data.map(normalizeFornecedor) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFornecedores();
  }, []);

  const filteredFornecedores = useMemo(() => {
    const term = search.trim().toLowerCase();

    return fornecedores.filter((fornecedor) => {
      const matchesSearch =
        !term ||
        fornecedor.razaoSocial.toLowerCase().includes(term) ||
        fornecedor.email.toLowerCase().includes(term) ||
        fornecedor.cnpj.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODOS" ||
        (statusFilter === "ATIVOS" && fornecedor.ativo) ||
        (statusFilter === "INATIVOS" && !fornecedor.ativo);

      return matchesSearch && matchesStatus;
    });
  }, [fornecedores, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "cnpj"
        ? formatCnpj(value)
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

  function openEditDialog(fornecedor) {
    setEditingId(fornecedor.id);
    setForm({
      id: fornecedor.id,
      razaoSocial: fornecedor.razaoSocial,
      nomeContato: fornecedor.nomeContato || "",
      cnpj: formatCnpj(fornecedor.cnpj),
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      endereco: fornecedor.endereco,
      ativo: fornecedor.ativo,
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

    if (!String(form.razaoSocial).trim()) errors.razaoSocial = "Informe a razão social.";
    if (!String(form.nomeContato).trim()) errors.nomeContato = "Informe o nome do contato.";
    if (!String(form.cnpj).trim()) errors.cnpj = "Informe o CNPJ.";
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
      razaoSocial: form.razaoSocial,
      nomeContato: form.nomeContato,
      cnpj: normalizeCnpjValue(form.cnpj),
      telefone: normalizeTelefoneValue(form.telefone),
      email: form.email,
      endereco: form.endereco,
    };

    try {
      if (editingId) {
        await updateFornecedor(editingId, payload);
        showSnackbar("Fornecedor atualizado com sucesso.", "success");
      } else {
        await createFornecedor(payload);
        showSnackbar("Fornecedor cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadFornecedores();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fornecedor) {
    try {
      await deleteFornecedor(fornecedor.id);
      showSnackbar("Fornecedor removido com sucesso.", "success");
      await loadFornecedores();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleDeactivate(fornecedor) {
    try {
      await deactivateFornecedor(fornecedor.id);
      showSnackbar("Fornecedor desativado com sucesso.", "success");
      await loadFornecedores();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "fornecedor",
      label: "Fornecedor",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.razaoSocial}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.email || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "contato",
      label: "Contato",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {row.nomeContato || "-"}
        </Typography>
      ),
    },
    {
      key: "cnpj",
      label: "CNPJ",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {formatCnpj(row.cnpj)}
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
          title="Fornecedores"
          subtitle="Gerencie os fornecedores cadastrados no sistema."
          actionLabel="Novo fornecedor"
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
              placeholder="Buscar por razão social, e-mail ou CNPJ"
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
          <AppLoading message="Carregando fornecedores..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredFornecedores}
            emptyMessage="Nenhum fornecedor encontrado."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingId ? "Editar fornecedor" : "Novo fornecedor"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingId ? "Salvar alterações" : "Cadastrar fornecedor"}
      >
        <AppTextField
          required
          name="razaoSocial"
          label="Razão social"
          value={form.razaoSocial}
          onChange={handleChange}
          error={Boolean(fieldErrors.razaoSocial)}
          helperText={fieldErrors.razaoSocial}
        />

        <AppTextField
          required
          name="nomeContato"
          label="Nome do contato"
          value={form.nomeContato}
          onChange={handleChange}
          error={Boolean(fieldErrors.nomeContato)}
          helperText={fieldErrors.nomeContato}
        />

        <AppTextField
          required
          name="cnpj"
          label="CNPJ"
          value={form.cnpj}
          onChange={handleChange}
          error={Boolean(fieldErrors.cnpj)}
          helperText={fieldErrors.cnpj}
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