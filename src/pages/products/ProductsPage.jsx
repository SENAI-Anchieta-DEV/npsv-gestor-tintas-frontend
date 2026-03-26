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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail/ProblemDetail";
import {
  createProduto,
  deleteProduto,
  getCategoriasProdutos,
  getProdutos,
  updateProduto,
} from "../../services/api";

const UNIDADE_OPTIONS = [
  { value: "UN", label: "UN" },
  { value: "G", label: "g" },
  { value: "KG", label: "kg" },
  { value: "ML", label: "ml" },
  { value: "L", label: "L" },
];

const INITIAL_FORM = {
  codigoBarras: "",
  descricao: "",
  quantidadeEstoque: "",
  precoCusto: "",
  precoVenda: "",
  unidadeMedida: "UN",
  categoriaId: "",
};

function normalizeProduto(item) {
  return {
    id: item?.id,
    codigoBarras: item?.codigoBarras || "-",
    descricao: item?.descricao || "-",
    quantidadeEstoque: item?.quantidadeEstoque ?? 0,
    precoCusto: item?.precoCusto ?? 0,
    precoVenda: item?.precoVenda ?? 0,
    unidadeMedida: item?.unidadeMedida || "UN",
    categoria: item?.categoria || null,
  };
}

function formatMoney(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("TODAS");
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadProdutos() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getProdutos();
      const normalized = Array.isArray(data) ? data.map(normalizeProduto) : [];
      setProdutos(normalized);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadCategorias() {
    try {
      const data = await getCategoriasProdutos();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  useEffect(() => {
    loadProdutos();
    loadCategorias();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return produtos.filter((produto) => {
      const matchCategoria =
        categoriaFiltro === "TODAS"
          ? true
          : String(produto.categoria?.id || "") === String(categoriaFiltro);

      const matchSearch =
        !term ||
        String(produto.descricao || "").toLowerCase().includes(term) ||
        String(produto.codigoBarras || "").toLowerCase().includes(term);

      return matchCategoria && matchSearch;
    });
  }, [produtos, search, categoriaFiltro]);

  function openCreate() {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEdit(produto) {
    setEditingProduct(produto);
    setForm({
      codigoBarras: produto.codigoBarras || "",
      descricao: produto.descricao || "",
      quantidadeEstoque: String(produto.quantidadeEstoque ?? ""),
      precoCusto: String(produto.precoCusto ?? ""),
      precoVenda: String(produto.precoVenda ?? ""),
      unidadeMedida: produto.unidadeMedida || "UN",
      categoriaId: String(produto.categoria?.id ?? ""),
    });
    setFieldErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingProduct(null);
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

  function validate() {
    const errors = {};

    if (!form.codigoBarras.trim()) {
      errors.codigoBarras = "Informe o código de barras.";
    }

    if (!form.descricao.trim()) {
      errors.descricao = "Informe a descrição.";
    }

    if (form.quantidadeEstoque === "") {
      errors.quantidadeEstoque = "Informe a quantidade em estoque.";
    } else if (Number(form.quantidadeEstoque) < 0) {
      errors.quantidadeEstoque =
        "A quantidade em estoque deve ser maior ou igual a zero.";
    }

    if (form.precoCusto === "") {
      errors.precoCusto = "Informe o preço de custo.";
    } else if (Number(form.precoCusto) <= 0) {
      errors.precoCusto = "O preço de custo deve ser maior que zero.";
    }

    if (form.precoVenda === "") {
      errors.precoVenda = "Informe o preço de venda.";
    } else if (Number(form.precoVenda) <= 0) {
      errors.precoVenda = "O preço de venda deve ser maior que zero.";
    }

    if (!form.unidadeMedida) {
      errors.unidadeMedida = "Selecione a unidade de medida.";
    }

    if (!form.categoriaId) {
      errors.categoriaId = "Selecione a categoria.";
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
        codigoBarras: form.codigoBarras.trim(),
        descricao: form.descricao.trim(),
        quantidadeEstoque: Number(form.quantidadeEstoque),
        precoCusto: Number(form.precoCusto),
        precoVenda: Number(form.precoVenda),
        unidadeMedida: form.unidadeMedida,
        categoriaId: form.categoriaId,
      };

      if (editingProduct) {
        await updateProduto(editingProduct.id, payload);
        showSnackbar("Produto atualizado com sucesso.", "success");
      } else {
        await createProduto(payload);
        showSnackbar("Produto cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadProdutos();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(produto) {
    const confirmed = window.confirm(
      `Deseja excluir o produto "${produto.descricao}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProduto(produto.id);
      showSnackbar("Produto excluído com sucesso.", "success");
      await loadProdutos();
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
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)",
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
                Gerenciar Produtos
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Cadastre, edite e exclua produtos e insumos
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
              Novo Produto
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Pesquisar por descrição ou código de barras..."
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

            <TextField
              select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="TODAS">Todas as categorias</MenuItem>
              {categorias.map((categoria) => (
                <MenuItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              px: 3,
              py: 4,
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando produtos...
              </Typography>
            </Stack>
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{errorMessage}</Alert>
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
                  <TableCell>Descrição</TableCell>
                  <TableCell>Código de Barras</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Unidade</TableCell>
                  <TableCell>Qtd. Estoque</TableCell>
                  <TableCell>Preço Custo</TableCell>
                  <TableCell>Preço Venda</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow
                    key={produto.id}
                    hover
                    sx={{
                      "& td": {
                        borderColor: "#E5E7EB",
                        py: 1.4,
                      },
                    }}
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
                          <Inventory2OutlinedIcon fontSize="small" />
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: 15,
                          }}
                        >
                          {produto.descricao}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {produto.codigoBarras}
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<CategoryOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={produto.categoria?.nome || "Sem categoria"}
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
                      {produto.unidadeMedida}
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {produto.quantidadeEstoque}
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatMoney(produto.precoCusto)}
                    </TableCell>

                    <TableCell sx={{ color: "#4B5563", fontSize: 14 }}>
                      {formatMoney(produto.precoVenda)}
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
                          onClick={() => openEdit(produto)}
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
                          onClick={() => handleDelete(produto)}
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

            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                Exibindo {produtosFiltrados.length} produtos cadastrados
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingProduct ? "Editar Produto" : "Cadastrar Produto"}
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Descrição"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.descricao)}
                helperText={fieldErrors.descricao}
                fullWidth
              />

              <TextField
                label="Código de Barras"
                name="codigoBarras"
                value={form.codigoBarras}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.codigoBarras)}
                helperText={fieldErrors.codigoBarras}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Quantidade em Estoque"
                  name="quantidadeEstoque"
                  type="number"
                  value={form.quantidadeEstoque}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.quantidadeEstoque)}
                  helperText={fieldErrors.quantidadeEstoque}
                  fullWidth
                />

                <TextField
                  select
                  label="Unidade de Medida"
                  name="unidadeMedida"
                  value={form.unidadeMedida}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.unidadeMedida)}
                  helperText={fieldErrors.unidadeMedida}
                  fullWidth
                >
                  {UNIDADE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Preço de Custo"
                  name="precoCusto"
                  type="number"
                  value={form.precoCusto}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.precoCusto)}
                  helperText={fieldErrors.precoCusto}
                  fullWidth
                />

                <TextField
                  label="Preço de Venda"
                  name="precoVenda"
                  type="number"
                  value={form.precoVenda}
                  onChange={handleChange}
                  required
                  error={Boolean(fieldErrors.precoVenda)}
                  helperText={fieldErrors.precoVenda}
                  fullWidth
                />
              </Stack>

              <TextField
                select
                label="Categoria"
                name="categoriaId"
                value={form.categoriaId}
                onChange={handleChange}
                required
                error={Boolean(fieldErrors.categoriaId)}
                helperText={
                  fieldErrors.categoriaId ||
                  (categorias.length === 0 ? "Nenhuma categoria carregada." : "")
                }
                fullWidth
              >
                {categorias.length === 0 ? (
                  <MenuItem disabled value="">
                    Nenhuma categoria disponível
                  </MenuItem>
                ) : (
                  categorias.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={saving}>
              {saving
                ? "Salvando..."
                : editingProduct
                ? "Salvar alterações"
                : "Cadastrar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AdminLayout>
  );
}