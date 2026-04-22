import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createFornecedor,
  deactivateFornecedor,
  getFornecedores,
  updateFornecedor,
} from "../../services/api";

import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

const INITIAL_FORM = {
  razaoSocial: "",
  cnpj: "",
  nomeContato: "",
  telefone: "",
  email: "",
  endereco: "",
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
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

function isValidCnpj(cnpj) {
  const cleaned = onlyDigits(cnpj);

  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calcDigit = (base, weights) => {
    const sum = base.split("").reduce((acc, digit, index) => {
      return acc + Number(digit) * weights[index];
    }, 0);

    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const firstDigit = calcDigit(cleaned.slice(0, 12), weightsFirst);
  const secondDigit = calcDigit(cleaned.slice(0, 12) + firstDigit, weightsSecond);

  return cleaned === `${cleaned.slice(0, 12)}${firstDigit}${secondDigit}`;
}

function normalizeFornecedor(item) {
  return {
    id: item?.id,
    razaoSocial: item?.razaoSocial || "-",
    cnpj: item?.cnpj || "-",
    nomeContato: item?.nomeContato || "-",
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

export default function SuppliersPage() {
  const { showSnackbar } = useAppSnackbar();

  const [fornecedores, setFornecedores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierToDeactivate, setSupplierToDeactivate] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return fornecedores;

    return fornecedores.filter((fornecedor) => {
      return (
        String(fornecedor.razaoSocial || "").toLowerCase().includes(term) ||
        String(fornecedor.cnpj || "").toLowerCase().includes(term)
      );
    });
  }, [fornecedores, search]);

  function openCreate() {
    setEditingSupplier(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(fornecedor) {
    setEditingSupplier(fornecedor);
    setForm({
      razaoSocial: fornecedor.razaoSocial || "",
      cnpj: fornecedor.cnpj || "",
      nomeContato: fornecedor.nomeContato || "",
      telefone: fornecedor.telefone || "",
      email: fornecedor.email || "",
      endereco: fornecedor.endereco || "",
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingSupplier(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function openDeactivateDialog(fornecedor) {
    setSupplierToDeactivate(fornecedor);
    setConfirmDialogOpen(true);
  }

  function closeDeactivateDialog() {
    if (deactivating) return;
    setSupplierToDeactivate(null);
    setConfirmDialogOpen(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "cnpj") {
      nextValue = formatCnpj(value);
    }

    if (name === "telefone") {
      nextValue = formatPhone(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.razaoSocial.trim()) {
      errors.razaoSocial = "Informe a razão social.";
    }

    if (!form.cnpj.trim()) {
      errors.cnpj = "Informe o CNPJ.";
    } else if (!isValidCnpj(form.cnpj)) {
      errors.cnpj = "Informe um CNPJ válido.";
    }

    if (!form.nomeContato.trim()) {
      errors.nomeContato = "Informe o nome do contato.";
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
        razaoSocial: form.razaoSocial.trim(),
        cnpj: onlyDigits(form.cnpj),
        nomeContato: form.nomeContato.trim(),
        telefone: onlyDigits(form.telefone),
        email: form.email.trim(),
        endereco: form.endereco.trim(),
      };

      if (editingSupplier) {
        await updateFornecedor(editingSupplier.id, payload);
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

  async function handleConfirmDeactivate() {
    if (!supplierToDeactivate?.id) return;

    setDeactivating(true);

    try {
      await deactivateFornecedor(supplierToDeactivate.id);
      showSnackbar("Fornecedor desativado com sucesso.", "success");
      closeDeactivateDialog();
      await loadFornecedores();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: "fornecedor",
      label: "Fornecedor",
      render: (fornecedor) => (
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
            <BusinessOutlinedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
              {fornecedor.razaoSocial}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {formatCnpj(fornecedor.cnpj)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "contato",
      label: "Contato",
      render: (fornecedor) => (
        <Box>
          <Typography sx={{ color: "text.primary", fontSize: 14 }}>
            {fornecedor.nomeContato}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            {formatPhone(fornecedor.telefone)} • {fornecedor.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: "endereco",
      label: "Endereço",
      render: (fornecedor) => (
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          {fornecedor.endereco}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (fornecedor) => (
        <Chip
          label={fornecedor.ativo ? "Ativo" : "Inativo"}
          size="small"
          sx={{ ...getStatusChipStyles(fornecedor.ativo), fontWeight: 700 }}
        />
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (fornecedor) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={() => openEdit(fornecedor)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => openDeactivateDialog(fornecedor)}
            disabled={!fornecedor.ativo}
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
          title="Fornecedores"
          subtitle="Cadastre, edite e desative fornecedores"
          actionLabel="Novo Fornecedor"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <AppSearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por razão social ou CNPJ..."
        />

        {errorMessage ? (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando fornecedores..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredSuppliers.map((item) => ({
              ...item,
              key: item.id,
            }))}
            emptyMessage="Nenhum fornecedor encontrado com os filtros informados."
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingSupplier ? "Editar fornecedor" : "Novo fornecedor"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={
          editingSupplier ? "Salvar alterações" : "Cadastrar fornecedor"
        }
      >
        <AppTextField
          name="razaoSocial"
          label="Razão social"
          required
          value={form.razaoSocial}
          onChange={handleChange}
          error={Boolean(fieldErrors.razaoSocial)}
          helperText={fieldErrors.razaoSocial}
        />

        <AppTextField
          name="cnpj"
          label="CNPJ"
          required
          value={form.cnpj}
          onChange={handleChange}
          error={Boolean(fieldErrors.cnpj)}
          helperText={fieldErrors.cnpj || "Formato: 00.000.000/0000-00"}
        />

        <AppTextField
          name="nomeContato"
          label="Nome do contato"
          required
          value={form.nomeContato}
          onChange={handleChange}
          error={Boolean(fieldErrors.nomeContato)}
          helperText={fieldErrors.nomeContato}
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
            Deseja desativar o fornecedor{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {supplierToDeactivate?.razaoSocial || "-"}
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