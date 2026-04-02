import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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

  return (
    <AdminLayout>
      <Paper
        sx={{
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 18px rgba(15,23,42,0.05)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
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
                Gerenciar Fórmulas
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Cadastre, edite e exclua fórmulas de tintas
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
              Nova Fórmula
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar por nome da cor ou código interno..."
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
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center", p: 4 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">Carregando fórmulas...</Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : formulasFiltradas.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>
              Nenhuma fórmula encontrada
            </Typography>
            <Typography sx={{ color: "#6B7280" }}>
              Cadastre uma nova fórmula para começar.
            </Typography>
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
                  <TableCell>Fórmula</TableCell>
                  <TableCell>Código Interno</TableCell>
                  <TableCell>Itens</TableCell>
                  <TableCell>Criação</TableCell>
                  <TableCell>Atualização</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formulasFiltradas.map((formula) => (
                  <TableRow
                    key={formula.id}
                    hover
                    sx={{ "& td": { borderColor: "#E5E7EB", py: 1.4 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "12px",
                            backgroundColor: "#EEF2FF",
                            color: "#4F46E5",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <ScienceOutlinedIcon fontSize="small" />
                        </Box>

                        <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
                          {formula.nomeCor}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formula.codigoInterno}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${formula.itens.length} item(ns)`}
                        sx={{
                          height: 28,
                          fontWeight: 700,
                          borderRadius: "999px",
                          color: "#4F46E5",
                          backgroundColor: "#EEF2FF",
                          border: "1px solid #C7D2FE",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatDateTime(formula.dataCriacao)}
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatDateTime(formula.dataAtualizacao)}
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
                          onClick={() => openEdit(formula)}
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
                          sx={{ color: "#DC2626" }}
                          onClick={() => handleDelete(formula)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {formulasFiltradas.length} fórmula(s)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingFormula ? "Editar Fórmula" : "Cadastrar Fórmula"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Nome da Cor"
                  name="nomeCor"
                  value={form.nomeCor}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.nomeCor)}
                  helperText={fieldErrors.nomeCor}
                  fullWidth
                />

                <TextField
                  label="Código Interno"
                  name="codigoInterno"
                  value={form.codigoInterno}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.codigoInterno)}
                  helperText={fieldErrors.codigoInterno}
                  fullWidth
                />
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#111827" }}>
                    Itens da Fórmula
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                    Adicione os insumos e suas quantidades-alvo
                  </Typography>
                </Box>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  Adicionar item
                </Button>
              </Stack>

              {form.itens.map((item, index) => (
                <Paper
                  key={`item-${index}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    borderColor: "#E5E7EB",
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 700, color: "#0B1739" }}>
                        Item {index + 1}
                      </Typography>

                      <Button
                        type="button"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={form.itens.length === 1}
                      >
                        Remover
                      </Button>
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        select
                        label="Insumo"
                        value={item.insumoId}
                        onChange={(e) =>
                          handleItemChange(index, "insumoId", e.target.value)
                        }
                        fullWidth
                      >
                        {produtos.map((produto) => (
                          <MenuItem key={produto.id} value={produto.id}>
                            {produto.descricao} — {produto.categoria?.nome || "Sem categoria"}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Quantidade Necessária"
                        type="number"
                        value={item.quantidadeNecessaria}
                        onChange={(e) =>
                          handleItemChange(index, "quantidadeNecessaria", e.target.value)
                        }
                        fullWidth
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}

              {fieldErrors.itens ? (
                <Alert severity="error">{fieldErrors.itens}</Alert>
              ) : null}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingFormula
                ? "Salvar alterações"
                : "Cadastrar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AdminLayout>
  );
}