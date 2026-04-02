import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Chip, IconButton, MenuItem, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  createProduto,
  deleteProduto,
  getCategoriasProdutos,
  getProdutos,
  updateProduto,
} from "../../services/api";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppSearchField from "../../components/common/AppSearchField";
import AppTextField from "../../components/common/AppTextField";

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
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
      setProdutos(Array.isArray(data) ? data.map(normalizeProduto) : []);
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
      const matchSearch =
        !term ||
        String(produto.descricao || "").toLowerCase().includes(term) ||
        String(produto.codigoBarras || "").toLowerCase().includes(term) ||
        String(produto.categoria?.nome || "").toLowerCase().includes(term);

      const matchCategoria =
        categoriaFiltro === "TODAS" || String(produto.categoria?.id) === String(categoriaFiltro);

      return matchSearch && matchCategoria;
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
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.codigoBarras.trim()) errors.codigoBarras = "Informe o código de barras.";
    if (!form.descricao.trim()) errors.descricao = "Informe a descrição.";
    if (form.quantidadeEstoque === "") errors.quantidadeEstoque = "Informe a quantidade em estoque.";
    else if (Number(form.quantidadeEstoque) < 0) errors.quantidadeEstoque = "A quantidade deve ser maior ou igual a zero.";
    if (form.precoCusto === "") errors.precoCusto = "Informe o preço de custo.";
    else if (Number(form.precoCusto) <= 0) errors.precoCusto = "O preço de custo deve ser maior que zero.";
    if (form.precoVenda === "") errors.precoVenda = "Informe o preço de venda.";
    else if (Number(form.precoVenda) <= 0) errors.precoVenda = "O preço de venda deve ser maior que zero.";
    if (!form.unidadeMedida) errors.unidadeMedida = "Selecione a unidade de medida.";
    if (!form.categoriaId) errors.categoriaId = "Selecione a categoria.";

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
    if (!window.confirm(`Deseja excluir o produto \"${produto.descricao}\"?`)) return;

    try {
      await deleteProduto(produto.id);
      showSnackbar("Produto excluído com sucesso.", "success");
      await loadProdutos();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "produto",
      label: "Produto",
      render: (produto) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "14px", display: "grid", placeItems: "center", backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
            <Inventory2OutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{produto.descricao}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{produto.codigoBarras}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "categoria",
      label: "Categoria",
      render: (produto) => <Typography>{produto.categoria?.nome || "-"}</Typography>,
    },
    {
      key: "estoque",
      label: "Estoque",
      render: (produto) => <Chip label={`${produto.quantidadeEstoque} ${produto.unidadeMedida}`} size="small" sx={{ fontWeight: 700 }} />,
    },
    {
      key: "precoCusto",
      label: "Preço de custo",
      render: (produto) => formatMoney(produto.precoCusto),
    },
    {
      key: "precoVenda",
      label: "Preço de venda",
      render: (produto) => formatMoney(produto.precoVenda),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (produto) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton onClick={() => openEdit(produto)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(produto)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Paper sx={{ borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 18px rgba(15, 23, 42, 0.05)", overflow: "hidden" }}>
        <AppPageHeader
          title="Gerenciar Produtos"
          subtitle="Cadastre, edite e exclua produtos e insumos"
          actionLabel="Novo Produto"
          actionIcon={<AddIcon />}
          onAction={openCreate}
        />

        <AppSearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por descrição, código de barras ou categoria..."
        />

        <Box sx={{ px: 2.5, pb: 2 }}>
          <AppTextField
            select
            label="Filtrar por categoria"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            helperText=" "
          >
            <MenuItem value="TODAS">Todas</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={String(categoria.id)}>
                {categoria.nome}
              </MenuItem>
            ))}
          </AppTextField>
        </Box>

        {errorMessage ? (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: "14px" }}>{errorMessage}</Alert>
          </Box>
        ) : null}

        {loading ? (
          <AppLoading message="Carregando produtos..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={produtosFiltrados.map((item) => ({ ...item, key: item.id }))}
            emptyMessage="Nenhum produto encontrado com os filtros informados."
          />
        )}
      </Paper>

      <AppFormDialog
        open={dialogOpen}
        title={editingProduct ? "Editar produto" : "Novo produto"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingProduct ? "Salvar alterações" : "Cadastrar produto"}
      >
        <AppTextField
          name="codigoBarras"
          label="Código de barras"
          required
          value={form.codigoBarras}
          onChange={handleChange}
          error={Boolean(fieldErrors.codigoBarras)}
          helperText={fieldErrors.codigoBarras}
        />

        <AppTextField
          name="descricao"
          label="Descrição"
          required
          value={form.descricao}
          onChange={handleChange}
          error={Boolean(fieldErrors.descricao)}
          helperText={fieldErrors.descricao}
        />

        <AppTextField
          name="quantidadeEstoque"
          label="Quantidade em estoque"
          type="number"
          required
          value={form.quantidadeEstoque}
          onChange={handleChange}
          error={Boolean(fieldErrors.quantidadeEstoque)}
          helperText={fieldErrors.quantidadeEstoque}
        />

        <AppTextField
          name="precoCusto"
          label="Preço de custo"
          type="number"
          required
          value={form.precoCusto}
          onChange={handleChange}
          error={Boolean(fieldErrors.precoCusto)}
          helperText={fieldErrors.precoCusto}
        />

        <AppTextField
          name="precoVenda"
          label="Preço de venda"
          type="number"
          required
          value={form.precoVenda}
          onChange={handleChange}
          error={Boolean(fieldErrors.precoVenda)}
          helperText={fieldErrors.precoVenda}
        />

        <AppTextField
          select
          name="unidadeMedida"
          label="Unidade de medida"
          required
          value={form.unidadeMedida}
          onChange={handleChange}
          error={Boolean(fieldErrors.unidadeMedida)}
          helperText={fieldErrors.unidadeMedida}
        >
          {UNIDADE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </AppTextField>

        <AppTextField
          select
          name="categoriaId"
          label="Categoria"
          required
          value={form.categoriaId}
          onChange={handleChange}
          error={Boolean(fieldErrors.categoriaId)}
          helperText={fieldErrors.categoriaId}
        >
          {categorias.map((categoria) => (
            <MenuItem key={categoria.id} value={String(categoria.id)}>
              {categoria.nome}
            </MenuItem>
          ))}
        </AppTextField>
      </AppFormDialog>
    </AdminLayout>
  );
}
