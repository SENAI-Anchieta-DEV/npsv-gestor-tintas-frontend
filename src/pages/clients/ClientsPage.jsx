import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createCliente,
  deactivateCliente,
  getClientes,
  updateCliente,
} from "../../services/api";

import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

const INITIAL_FORM = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function isValidCpf(cpf) {
  const cleaned = onlyDigits(cpf);

  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cleaned[i]) * (10 - i);
  }

  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== Number(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cleaned[i]) * (11 - i);
  }

  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;

  return secondDigit === Number(cleaned[10]);
}

function normalizeCliente(item) {
  return {
    id: item?.id,
    nome: item?.nome || "-",
    cpf: item?.cpf || "-",
    telefone: item?.telefone || "-",
    email: item?.email || "-",
    endereco: item?.endereco || "-",
    ativo: Boolean(item?.ativo),
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

export default function ClientsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientToDeactivate, setClientToDeactivate] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clientes;

    return clientes.filter((cliente) => {
      return (
        String(cliente.nome || "").toLowerCase().includes(term) ||
        String(cliente.cpf || "").toLowerCase().includes(term)
      );
    });
  }, [clientes, search]);

  function openCreate() {
    setEditingClient(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(cliente) {
    setEditingClient(cliente);
    setForm({
      nome: cliente.nome || "",
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      endereco: cliente.endereco || "",
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingClient(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function openDeactivateDialog(cliente) {
    setClientToDeactivate(cliente);
    setConfirmDialogOpen(true);
  }

  function closeDeactivateDialog() {
    if (deactivating) return;
    setClientToDeactivate(null);
    setConfirmDialogOpen(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "cpf") {
      nextValue = formatCpf(value);
    }

    if (name === "telefone") {
      nextValue = formatPhone(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.nome.trim()) {
      errors.nome = "Informe o nome.";
    }

    if (!form.cpf.trim()) {
      errors.cpf = "Informe o CPF.";
    } else if (!isValidCpf(form.cpf)) {
      errors.cpf = "Informe um CPF válido.";
    }

    if (!form.telefone.trim()) {
      errors.telefone = "Informe o telefone.";
    }

    if (!form.email.trim()) {
      errors.email = "Informe o e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!form.endereco.trim()) {
      errors.endereco = "Informe o endereço.";
    }

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
        cpf: onlyDigits(form.cpf),
        telefone: onlyDigits(form.telefone),
        email: form.email.trim(),
        endereco: form.endereco.trim(),
      };

      if (editingClient) {
        await updateCliente(editingClient.id, payload);
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

  async function handleConfirmDeactivate() {
    if (!clientToDeactivate?.id) return;

    setDeactivating(true);

    try {
      await deactivateCliente(clientToDeactivate.id);
      showSnackbar("Cliente desativado com sucesso.", "success");
      closeDeactivateDialog();
      await loadClientes();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: "cliente",
      label: "Cliente",
      render: (cliente) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
            }}
          >
            <PersonOutlineOutlinedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
              {cliente.nome}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {formatCpf(cliente.cpf)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "contato",
      label: "Contato",
      render: (cliente) => (
        <Box>
          <Typography sx={{ color: "text.primary", fontSize: 14 }}>
            {formatPhone(cliente.telefone)}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            {cliente.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: "endereco",
      label: "Endereço",
      render: (cliente) => (
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          {cliente.endereco}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (cliente) => (
        <Chip
          label={cliente.ativo ? "Ativo" : "Inativo"}
          size="small"
          sx={{ ...getStatusChipStyles(cliente.ativo), fontWeight: 700 }}
        />
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (cliente) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={() => openEdit(cliente)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => openDeactivateDialog(cliente)}
            disabled={!cliente.ativo}
          >
            <PersonOffOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Paper
        sx={{
          borderRadius: { xs: "16px", md: "20px" },
          border: "none",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
          overflow: "hidden",
        }}
      >
        <AppPageHeader
          title="Clientes"
          subtitle="Cadastre, edite e desative clientes"
          actionLabel="Novo Cliente"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <AppSearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou CPF..."
        />

        {errorMessage ? (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando clientes..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredClients.map((item) => ({
              ...item,
              key: item.id,
            }))}
            emptyMessage="Nenhum cliente encontrado com os filtros informados."
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingClient ? "Editar cliente" : "Novo cliente"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingClient ? "Salvar alterações" : "Cadastrar cliente"}
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
          name="cpf"
          label="CPF"
          required
          value={form.cpf}
          onChange={handleChange}
          error={Boolean(fieldErrors.cpf)}
          helperText={fieldErrors.cpf || "Formato: 000.000.000-00"}
        />

        <AppTextField
          name="telefone"
          label="Telefone"
          required
          value={form.telefone}
          onChange={handleChange}
          error={Boolean(fieldErrors.telefone)}
          helperText={fieldErrors.telefone}
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
          name="endereco"
          label="Endereço"
          required
          multiline
          minRows={3}
          value={form.endereco}
          onChange={handleChange}
          error={Boolean(fieldErrors.endereco)}
          helperText={fieldErrors.endereco}
        />
      </AppFormDialog>

      <Dialog open={confirmDialogOpen} onClose={closeDeactivateDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirmar desativação
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Deseja desativar o cliente{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {clientToDeactivate?.nome || "-"}
            </Box>
            ?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDeactivateDialog} disabled={deactivating}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeactivate}
            disabled={deactivating}
          >
            {deactivating ? "Desativando..." : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}