import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
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
  createFormula,
  deleteFormula,
  getFormulas,
  getProdutos,
  updateFormula,
} from "../../services/api";

const INITIAL_ITEM = {
  insumoId: "",
  quantidadeNecessaria: "",
};

const INITIAL_FORM = {
  codigoInterno: "",
  nomeCor: "",
  itens: [INITIAL_ITEM],
};

function normalizeFormula(item) {
  return {
    id: item?.id || "",
    codigoInterno: item?.codigoInterno || "-",
    nomeCor: item?.nomeCor || "-",
    dataCriacao: item?.dataCriacao || null,
    dataAtualizacao: item?.dataAtualizacao || null,
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizeProduto(item) {
  return {
    id: item?.id || "",
    descricao: item?.descricao || "-",
    codigoBarras: item?.codigoBarras || "-",
    categoria: item?.categoria || null,
    unidadeMedida: item?.unidadeMedida || "UN",
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

function isProdutoInsumo(produto) {
  const nomeCategoria = String(produto?.categoria?.nome || "").toLowerCase();
  return (
    nomeCategoria.includes("base") ||
    nomeCategoria.includes("pigmento") ||
    nomeCategoria.includes("insumo")
  );
}

export default function FormulasPage() {
  const { showSnackbar } = useAppSnackbar();

  const [formulas, setFormulas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadFormulas() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getFormulas();
      setFormulas(Array.isArray(data) ? data.map(normalizeFormula) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadProdutos() {
    try {
      const data = await getProdutos();
      const normalized = Array.isArray(data) ? data.map(normalizeProduto) : [];
      setProdutos(normalized.filter(isProdutoInsumo));
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  useEffect(() => {
    loadFormulas();
    loadProdutos();
  }, []);

  const formulasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();

    if (!termo) return formulas;

    return formulas.filter((formula) => {
      return (
        String(formula.nomeCor || "").toLowerCase().includes(termo) ||
        String(formula.codigoInterno || "").toLowerCase().includes(termo)
      );
    });
  }, [formulas, search]);

  function openCreate() {
    setEditingFormula(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(formula) {
    setEditingFormula(formula);
    setForm({
      codigoInterno: formula.codigoInterno || "",
      nomeCor: formula.nomeCor || "",
      itens:
        formula.itens?.length > 0
          ? formula.itens.map((item) => ({
              insumoId: item?.insumo?.id || "",
              quantidadeNecessaria: String(item?.quantidadeNecessaria ?? ""),
            }))
          : [INITIAL_ITEM],
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingFormula(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleItemChange(index, field, value) {
    setForm((prev) => {
      const itens = [...prev.itens];
      itens[index] = {
        ...itens[index],
        [field]: value,
      };
      return { ...prev, itens };
    });
    setFieldErrors((prev) => ({ ...prev, itens: "" }));
  }

  function handleAddItem() {
    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, { ...INITIAL_ITEM }],
    }));
  }

  function handleRemoveItem(index) {
    setForm((prev) => {
      if (prev.itens.length === 1) return prev;
      return {
        ...prev,
        itens: prev.itens.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function validate() {
    const errors = {};

    if (!form.codigoInterno.trim()) {
      errors.codigoInterno = "Informe o código interno.";
    }

    if (!form.nomeCor.trim()) {
      errors.nomeCor = "Informe o nome da cor.";
    }

    if (!form.itens.length) {
      errors.itens = "A fórmula precisa ter pelo menos um insumo.";
    }

    const itensInvalidos = form.itens.some((item) => {
      return (
        !item.insumoId ||
        item.quantidadeNecessaria === "" ||
        Number(item.quantidadeNecessaria) <= 0
      );
    });

    if (itensInvalidos) {
      errors.itens =
        "Preencha corretamente todos os insumos e quantidades necessárias.";
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
        codigoInterno: form.codigoInterno.trim(),
        nomeCor: form.nomeCor.trim(),
        itens: form.itens.map((item, index) => ({
          quantidadeNecessaria: Number(item.quantidadeNecessaria),
          ordemAdicao: index + 1,
          insumoId: item.insumoId,
        })),
      };

      if (editingFormula) {
        await updateFormula(editingFormula.id, payload);
        showSnackbar("Fórmula atualizada com sucesso.", "success");
      } else {
        await createFormula(payload);
        showSnackbar("Fórmula cadastrada com sucesso.", "success");
      }

      closeDialog();
      await loadFormulas();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(formula) {
    const confirmed = window.confirm(
      `Deseja excluir a fórmula "${formula.nomeCor}"?`
    );

    if (!confirmed) return;

    try {
      await deleteFormula(formula.id);
      showSnackbar("Fórmula excluída com sucesso.", "success");
      await loadFormulas();
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
            {row.nomeCor}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.codigoInterno}
          </Typography>
        </Box>
      ),
    },
    {
      key: "itens",
      label: "Itens",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {row.itens?.length || 0}
        </Typography>
      ),
    },
    {
      key: "datas",
      label: "Última atualização",
      render: (row) => (
        <Typography sx={{ color: "text.secondary" }}>
          {formatDateTime(row.dataAtualizacao || row.dataCriacao)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <Chip
          label="Ativa"
          sx={{
            fontWeight: 700,
            color: "#FFFFFF",
            backgroundColor: "success.main",
            border: "1px solid",
            borderColor: "success.main",
          }}
        />
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => openEdit(row)}>
            <EditOutlinedIcon />
          </IconButton>
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
          title="Fórmulas"
          subtitle="Gerencie as fórmulas cadastradas no sistema."
          actionLabel="Nova fórmula"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <Box sx={{ px: 3, pb: 2, display: "grid", gap: 2 }}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 2,
              alignItems: "start",
              pt: 1.5,
            }}
          >
            <AppTextField
              placeholder="Buscar por nome da cor ou código interno"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando fórmulas..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={formulasFiltradas}
            emptyMessage="Nenhuma fórmula encontrada."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingFormula ? "Editar fórmula" : "Nova fórmula"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingFormula ? "Salvar alterações" : "Cadastrar fórmula"}
      >
        <AppTextField
          required
          name="nomeCor"
          label="Nome da cor"
          value={form.nomeCor}
          onChange={handleChange}
          error={Boolean(fieldErrors.nomeCor)}
          helperText={fieldErrors.nomeCor}
        />

        <AppTextField
          required
          name="codigoInterno"
          label="Código interno"
          value={form.codigoInterno}
          onChange={handleChange}
          error={Boolean(fieldErrors.codigoInterno)}
          helperText={fieldErrors.codigoInterno}
        />

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
              Itens da fórmula
            </Typography>

            <Button
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ borderRadius: "14px", textTransform: "none" }}
            >
              Adicionar item
            </Button>
          </Box>

          {form.itens.map((item, index) => (
            <Paper
              key={`item-${index}`}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "16px",
                borderColor: "divider",
                boxShadow: "none",
                mb: 2,
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
                    alignItems: "end",
                  }}
                >
                  <AppTextField
                    select
                    label="Insumo"
                    value={item.insumoId}
                    onChange={(e) =>
                      handleItemChange(index, "insumoId", e.target.value)
                    }
                    helperText=" "
                  >
                    {produtos.map((produto) => (
                      <MenuItem key={produto.id} value={produto.id}>
                        {produto.descricao} —{" "}
                        {produto.categoria?.nome || "Sem categoria"}
                      </MenuItem>
                    ))}
                  </AppTextField>

                  <AppTextField
                    label="Quantidade necessária"
                    name="quantidadeNecessaria"
                    type="number"
                    value={item.quantidadeNecessaria}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantidadeNecessaria",
                        e.target.value
                      )
                    }
                    helperText=" "
                  />

                  <Button
                    type="button"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    sx={{
                      alignSelf: { xs: "start", md: "end" },
                      borderRadius: "14px",
                      textTransform: "none",
                      minWidth: 120,
                    }}
                  >
                    Remover
                  </Button>
                </Box>
              </Stack>
            </Paper>
          ))}

          {fieldErrors.itens ? (
            <Alert severity="error">{fieldErrors.itens}</Alert>
          ) : null}
        </Box>
      </AppFormDialog>
    </AdminLayout>
  );
}