import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createFormula,
  deleteFormula,
  getFormulas,
  getProdutos,
  updateFormula,
} from "../../services/api";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

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
    id: item?.id,
    codigoInterno: item?.codigoInterno || "-",
    nomeCor: item?.nomeCor || "-",
    dataCriacao: item?.dataCriacao || null,
    dataAtualizacao: item?.dataAtualizacao || null,
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizeProduto(item) {
  return {
    id: item?.id,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      render: (formula) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
              flexShrink: 0,
            }}
          >
            <ScienceOutlinedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: 14.5,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {formula.nomeCor}
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 13,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {formula.codigoInterno}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "itens",
      label: "Itens",
      render: (formula) => (
        <Chip
          label={`${formula.itens.length} item(ns)`}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      key: "criacao",
      label: "Criação",
      render: (formula) => formatDateTime(formula.dataCriacao),
    },
    {
      key: "atualizacao",
      label: "Atualização",
      render: (formula) => formatDateTime(formula.dataAtualizacao),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (formula) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={() => openEdit(formula)}
            aria-label={`Editar fórmula ${formula.nomeCor}`}
            size={isMobile ? "medium" : "small"}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(formula)}
            aria-label={`Excluir fórmula ${formula.nomeCor}`}
            size={isMobile ? "medium" : "small"}
          >
            <DeleteOutlineIcon fontSize="small" />
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
          border: "1px solid",
          borderColor: "divider",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0,0,0,0.28)"
              : "0 4px 18px rgba(15, 23, 42, 0.05)",
          overflow: "hidden",
        }}
      >
        <AppPageHeader
          title="Gerenciar Fórmulas"
          subtitle="Cadastre, edite e exclua fórmulas de tintas"
          actionLabel="Nova Fórmula"
          actionIcon={<AddIcon />}
          onAction={openCreate}
          actionSx={{
            width: { xs: "100%", md: "auto" },
          }}
          contentSx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        />

        <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2 }}>
          <AppSearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome da cor ou código interno..."
          />
        </Box>

        {errorMessage ? (
          <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando fórmulas..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={formulasFiltradas.map((item) => ({ ...item, key: item.id }))}
            emptyMessage="Nenhuma fórmula encontrada."
            containerSx={{
              px: { xs: 1.5, md: 2.5 },
              pb: { xs: 2, md: 2.5 },
            }}
            tableWrapperSx={{
              overflowX: "auto",
            }}
            tableSx={{
              minWidth: 720,
            }}
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingFormula ? "Editar fórmula" : "Nova fórmula"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingFormula ? "Salvar alterações" : "Cadastrar fórmula"}
        fullScreen={isMobile}
        dialogProps={{
          maxWidth: "md",
          fullWidth: true,
        }}
        actionsSx={{
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}
        submitButtonSx={{
          width: { xs: "100%", sm: "auto" },
        }}
        cancelButtonSx={{
          width: { xs: "100%", sm: "auto" },
        }}
        contentSx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        <AppTextField
          name="nomeCor"
          label="Nome da cor"
          required
          value={form.nomeCor}
          onChange={handleChange}
          error={Boolean(fieldErrors.nomeCor)}
          helperText={fieldErrors.nomeCor}
        />

        <AppTextField
          name="codigoInterno"
          label="Código interno"
          required
          value={form.codigoInterno}
          onChange={handleChange}
          error={Boolean(fieldErrors.codigoInterno)}
          helperText={fieldErrors.codigoInterno}
        />

        <Box sx={{ pt: 0.5 }}>
          <Typography sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            Itens da fórmula
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Adicione os insumos e suas quantidades-alvo.
          </Typography>

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{
              width: { xs: "100%", sm: "auto" },
              mb: 2,
            }}
          >
            Adicionar item
          </Button>

          <Box sx={{ display: "grid", gap: 2 }}>
            {form.itens.map((item, index) => (
              <Paper
                key={`item-${index}`}
                variant="outlined"
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: "16px",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "stretch", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                      Item {index + 1}
                    </Typography>

                    <Button
                      type="button"
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      disabled={form.itens.length === 1}
                      sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
                    >
                      Remover
                    </Button>
                  </Box>

                  <AppTextField
                    select
                    label="Insumo"
                    value={item.insumoId}
                    onChange={(e) =>
                      handleItemChange(index, "insumoId", e.target.value)
                    }
                  >
                    {produtos.map((produto) => (
                      <MenuItem key={produto.id} value={produto.id}>
                        {produto.descricao} — {produto.categoria?.nome || "Sem categoria"}
                      </MenuItem>
                    ))}
                  </AppTextField>

                  <AppTextField
                    label="Quantidade necessária"
                    type="number"
                    value={item.quantidadeNecessaria}
                    onChange={(e) =>
                      handleItemChange(index, "quantidadeNecessaria", e.target.value)
                    }
                  />
                </Box>
              </Paper>
            ))}
          </Box>

          {fieldErrors.itens ? (
            <Alert severity="error" sx={{ mt: 2, borderRadius: "14px" }}>
              {fieldErrors.itens}
            </Alert>
          ) : null}
        </Box>
      </AppFormDialog>
    </AdminLayout>
  );
}