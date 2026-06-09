import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
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
  cancelarProducao,
  concluirProducao,
  getCurrentUserEmailFromToken,
  getUsuarioByEmail,
  getFormulas,
  getProducoes,
  iniciarProducao,
  registrarPerdaTotal,
} from "../../services/api";

const INITIAL_FORM = {
  formulaId: "",
};

function normalizeProducao(item) {
  return {
    id: item?.id || "",
    formulaNome:
      item?.formula?.nomeCor || item?.formulaNome || item?.formula?.nome || "-",
    formulaCodigo:
      item?.formula?.codigoInterno || item?.formulaCodigo || "-",
    status: item?.status || "PENDENTE",
    dataHora: item?.dataHora || "",
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export default function ProductionsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [producoes, setProducoes] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [producoesData, formulasData] = await Promise.all([
        getProducoes(),
        getFormulas(),
      ]);

      setProducoes(Array.isArray(producoesData) ? producoesData.map(normalizeProducao) : []);
      setFormulas(Array.isArray(formulasData) ? formulasData : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducoes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return producoes.filter((producao) => {
      const matchesSearch =
        !term ||
        producao.formulaNome.toLowerCase().includes(term) ||
        producao.formulaCodigo.toLowerCase().includes(term) ||
        String(producao.id).toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODAS" || producao.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [producoes, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function openCreateDialog() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function validateForm() {
    const errors = {};
    if (!form.formulaId) errors.formulaId = "Selecione a fórmula.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getUsuarioIdFromResponse(usuario) {
  return (
    usuario?.id ||
    usuario?.usuarioId ||
    usuario?.data?.id ||
    usuario?.data?.usuarioId ||
    ""
  );
}

async function getUsuarioLogadoId() {
  const emailUsuarioLogado = getCurrentUserEmailFromToken();

  if (!emailUsuarioLogado) {
    throw new Error("Não foi possível identificar o usuário logado.");
  }

  const usuarioLogado = await getUsuarioByEmail(emailUsuarioLogado);
  const usuarioId = getUsuarioIdFromResponse(usuarioLogado);

  if (!usuarioId) {
    throw new Error("Não foi possível localizar o ID do usuário logado.");
  }

  return usuarioId;
}

  async function handleSubmit(event) {
  event.preventDefault();

  if (!validateForm()) return;

  setSaving(true);

  try {
    const usuarioId = await getUsuarioLogadoId();

    await iniciarProducao({
      formulaId: form.formulaId,
      coloristaId: usuarioId,
    });

    showSnackbar("Produção iniciada com sucesso.", "success");
    closeDialog();
    await loadData();
  } catch (error) {
    showSnackbar(getProblemDetailMessage(error), "error");
  } finally {
    setSaving(false);
  }
}

  async function handleConcluir(id) {
    try {
      await concluirProducao(id);
      showSnackbar("Produção concluída com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleCancelar(id) {
    try {
      await cancelarProducao(id);
      showSnackbar("Produção cancelada com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handlePerdaTotal(id) {
    try {
      await registrarPerdaTotal(id);
      showSnackbar("Perda total registrada com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "formula",
      label: "Fórmula",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.formulaNome}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.formulaCodigo}
          </Typography>
        </Box>
      ),
    },
    {
      key: "dataHora",
      label: "Data",
      render: (row) => (
        <Typography sx={{ color: "text.secondary" }}>
          {formatDateTime(row.dataHora)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip
          label={row.status}
          sx={{
            fontWeight: 700,
            color:
              row.status === "CONCLUIDO"
                ? "#FFFFFF"
                : row.status === "PROCESSANDO"
                ? "#FFFFFF"
                : row.status === "PERDA_TOTAL"
                ? "#FFFFFF"
                : "#FFFFFF",
            backgroundColor:
              row.status === "CONCLUIDO"
                ? "success.main"
                : row.status === "PROCESSANDO"
                ? "info.main"
                : row.status === "PERDA_TOTAL"
                ? "error.main"
                : "warning.main",
            border: "1px solid",
            borderColor:
              row.status === "CONCLUIDO"
                ? "success.main"
                : row.status === "PROCESSANDO"
                ? "info.main"
                : row.status === "PERDA_TOTAL"
                ? "error.main"
                : "warning.main",
          }}
        />
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {(row.status === "PENDENTE" || row.status === "PROCESSANDO") && (
            <Tooltip title="Concluir produção" arrow>
              <IconButton color="success" onClick={() => handleConcluir(row.id)}>
                <CheckCircleOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

          {(row.status === "PENDENTE" || row.status === "PROCESSANDO") && (
            <Tooltip title="Registrar perda total" arrow>
              <IconButton color="warning" onClick={() => handlePerdaTotal(row.id)}>
                <PlayArrowOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

          {row.status !== "CONCLUIDO" && (
            <Tooltip title="Cancelar produção" arrow>
              <IconButton color="error" onClick={() => handleCancelar(row.id)}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
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
          title="Histórico de Produção"
          subtitle="Acompanhe o ciclo de produção das fórmulas."
          actionLabel="Nova produção"
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
              placeholder="Buscar por fórmula, código ou ID"
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
              <MenuItem value="TODAS">Todas</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="PROCESSANDO">Processando</MenuItem>
              <MenuItem value="CONCLUIDO">Concluído</MenuItem>
              <MenuItem value="PERDA_TOTAL">Perda total</MenuItem>
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando produções..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredProducoes}
            emptyMessage="Nenhuma produção encontrada."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title="Nova produção"
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Iniciar produção"
      >
        <AppTextField
          select
          required
          name="formulaId"
          label="Fórmula"
          value={form.formulaId}
          onChange={handleChange}
          error={Boolean(fieldErrors.formulaId)}
          helperText={fieldErrors.formulaId}
        >
          {formulas.map((formula) => (
            <MenuItem key={formula.id} value={formula.id}>
              {formula.nomeCor || formula.nome || formula.codigoInterno}
            </MenuItem>
          ))}
        </AppTextField>
      </AppFormDialog>
    </AdminLayout>
  );
}