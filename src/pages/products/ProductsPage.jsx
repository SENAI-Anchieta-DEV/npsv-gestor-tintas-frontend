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
  createProduto,
  deleteProduto,
  getCategoriasProdutos,
  getProdutos,
  updateProduto,
} from "../../services/api";

const INITIAL_FORM = {
  id: "",
  codigoBarras: "",
  descricao: "",
  quantidadeEstoque: "",
  precoCusto: "",
  precoVenda: "",
  unidadeMedida: "UN",
  categoriaId: "",
  estoqueMinimo: "",
};

const UNIDADES = [
  { value: "UN", label: "Unidade" },
  { value: "KG", label: "Quilograma" },
  { value: "G", label: "Grama" },
  { value: "L", label: "Litro" },
  { value: "ML", label: "Mililitro" },
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizeProduto(item) {
  return {
    id: item?.id || "",
    codigoBarras: item?.codigoBarras || "",
    descricao: item?.descricao || "",
    quantidadeEstoque: Number(item?.quantidadeEstoque || 0),
    precoCusto: Number(item?.precoCusto || 0),
    precoVenda: Number(item?.precoVenda || 0),
    unidadeMedida: item?.unidadeMedida || "UN",
    categoriaId: item?.categoria?.id || item?.categoriaId || "",
    categoriaNome: item?.categoria?.nome || item?.categoriaNome || "-",
    estoqueMinimo: Number(item?.estoqueMinimo || 0),
    estoqueEmAlerta: Boolean(item?.estoqueEmAlerta),
  };
}

function getStockChip(row) {
  if (row.quantidadeEstoque <= 0) {
    return {
      label: "Sem estoque",
      color: "error.main",
    };
  }

  if (
    row.estoqueEmAlerta ||
    row.quantidadeEstoque <= row.estoqueMinimo
  ) {
    return {
      label: "Estoque baixo",
      color: "warning.main",
    };
  }

  return {
    label: "Disponível",
    color: "success.main",
  };
}

export default function ProductsPage() {
  const { showSnackbar } = useAppSnackbar();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [produtosData, categoriasData] = await Promise.all([
        getProdutos(),
        getCategoriasProdutos(),
      ]);

      setProdutos(
        Array.isArray(produtosData)
          ? produtosData.map(normalizeProduto)
          : []
      );
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProdutos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return produtos.filter((produto) => {
      const matchesSearch =
        !term ||
        produto.descricao.toLowerCase().includes(term) ||
        produto.codigoBarras.toLowerCase().includes(term) ||
        produto.categoriaNome.toLowerCase().includes(term);

      const stockStatus =
        produto.quantidadeEstoque <= 0
          ? "SEM_ESTOQUE"
          : produto.estoqueEmAlerta ||
            produto.quantidadeEstoque <= produto.estoqueMinimo
          ? "BAIXO"
          : "DISPONIVEL";

      const matchesStock =
        stockFilter === "TODOS" || stockFilter === stockStatus;

      return matchesSearch && matchesStock;
    });
  }, [produtos, search, stockFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function openCreateDialog() {
    setEditingId("");
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(produto) {
    setEditingId(produto.id);
    setForm({
      id: produto.id,
      codigoBarras: produto.codigoBarras,
      descricao: produto.descricao,
      quantidadeEstoque: String(produto.quantidadeEstoque),
      precoCusto: String(produto.precoCusto),
      precoVenda: String(produto.precoVenda),
      unidadeMedida: produto.unidadeMedida,
      categoriaId: produto.categoriaId,
      estoqueMinimo: String(produto.estoqueMinimo),
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

    if (!String(form.codigoBarras).trim()) {
      errors.codigoBarras = "Informe o código de barras.";
    }
    if (!String(form.descricao).trim()) {
      errors.descricao = "Informe a descrição.";
    }
    if (!String(form.quantidadeEstoque).trim()) {
      errors.quantidadeEstoque = "Informe o estoque.";
    }
    if (!String(form.precoCusto).trim()) {
      errors.precoCusto = "Informe o preço de custo.";
    }
    if (!String(form.precoVenda).trim()) {
      errors.precoVenda = "Informe o preço de venda.";
    }
    if (!String(form.categoriaId).trim()) {
      errors.categoriaId = "Selecione a categoria.";
    }
    if (!String(form.estoqueMinimo).trim()) {
      errors.estoqueMinimo = "Informe o estoque mínimo.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      codigoBarras: form.codigoBarras,
      descricao: form.descricao,
      quantidadeEstoque: Number(form.quantidadeEstoque),
      precoCusto: Number(form.precoCusto),
      precoVenda: Number(form.precoVenda),
      unidadeMedida: form.unidadeMedida,
      categoriaId: form.categoriaId,
      estoqueMinimo: Number(form.estoqueMinimo),
    };

    try {
      if (editingId) {
        await updateProduto(editingId, payload);
        showSnackbar("Produto atualizado com sucesso.", "success");
      } else {
        await createProduto(payload);
        showSnackbar("Produto cadastrado com sucesso.", "success");
      }

      closeDialog();
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(produto) {
    try {
      await deleteProduto(produto.id);
      showSnackbar("Produto removido com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  const columns = [
    {
      key: "produto",
      label: "Produto",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.descricao}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.codigoBarras}
          </Typography>
        </Box>
      ),
    },
    {
      key: "categoria",
      label: "Categoria",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {row.categoriaNome}
        </Typography>
      ),
    },
    {
      key: "estoque",
      label: "Estoque",
      render: (row) => (
        <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
          {row.quantidadeEstoque} {row.unidadeMedida}
        </Typography>
      ),
    },
    {
      key: "precos",
      label: "Preços",
      render: (row) => (
        <Box>
          <Typography sx={{ color: "text.primary", fontSize: 13 }}>
            Custo: {formatMoney(row.precoCusto)}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            Venda: {formatMoney(row.precoVenda)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const chip = getStockChip(row);
        return (
          <Chip
            label={chip.label}
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: chip.color,
              border: "1px solid",
              borderColor: chip.color,
            }}
          />
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Editar produto" arrow>
            <IconButton onClick={() => openEditDialog(row)}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir produto" arrow>
            <IconButton color="error" onClick={() => handleDelete(row)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
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
          title="Produtos"
          subtitle="Gerencie os produtos e acompanhe o estoque."
          actionLabel="Novo produto"
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
              placeholder="Buscar por descrição, código ou categoria"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            />

            <AppTextField
              select
              label="Estoque"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              helperText=" "
              sx={{ mt: 0.5 }}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="DISPONIVEL">Disponível</MenuItem>
              <MenuItem value="BAIXO">Estoque baixo</MenuItem>
              <MenuItem value="SEM_ESTOQUE">Sem estoque</MenuItem>
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando produtos..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredProdutos}
            emptyMessage="Nenhum produto encontrado."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title={editingId ? "Editar produto" : "Novo produto"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={editingId ? "Salvar alterações" : "Cadastrar produto"}
      >
        <AppTextField
          required
          name="codigoBarras"
          label="Código de barras"
          value={form.codigoBarras}
          onChange={handleChange}
          error={Boolean(fieldErrors.codigoBarras)}
          helperText={fieldErrors.codigoBarras}
        />

        <AppTextField
          required
          name="descricao"
          label="Descrição"
          value={form.descricao}
          onChange={handleChange}
          error={Boolean(fieldErrors.descricao)}
          helperText={fieldErrors.descricao}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <AppTextField
            required
            name="quantidadeEstoque"
            label="Quantidade em estoque"
            type="number"
            value={form.quantidadeEstoque}
            onChange={handleChange}
            error={Boolean(fieldErrors.quantidadeEstoque)}
            helperText={fieldErrors.quantidadeEstoque}
          />

          <AppTextField
            select
            required
            name="unidadeMedida"
            label="Unidade de medida"
            value={form.unidadeMedida}
            onChange={handleChange}
          >
            {UNIDADES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </AppTextField>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <AppTextField
            required
            name="precoCusto"
            label="Preço de custo"
            type="number"
            value={form.precoCusto}
            onChange={handleChange}
            error={Boolean(fieldErrors.precoCusto)}
            helperText={fieldErrors.precoCusto}
          />

          <AppTextField
            required
            name="precoVenda"
            label="Preço de venda"
            type="number"
            value={form.precoVenda}
            onChange={handleChange}
            error={Boolean(fieldErrors.precoVenda)}
            helperText={fieldErrors.precoVenda}
          />
        </Box>

        <AppTextField
          select
          required
          name="categoriaId"
          label="Categoria"
          value={form.categoriaId}
          onChange={handleChange}
          error={Boolean(fieldErrors.categoriaId)}
          helperText={fieldErrors.categoriaId}
        >
          {categorias.map((categoria) => (
            <MenuItem key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </MenuItem>
          ))}
        </AppTextField>

        <AppTextField
          required
          name="estoqueMinimo"
          label="Estoque mínimo"
          type="number"
          value={form.estoqueMinimo}
          onChange={handleChange}
          error={Boolean(fieldErrors.estoqueMinimo)}
          helperText={fieldErrors.estoqueMinimo}
        />
      </AppFormDialog>
    </AdminLayout>
  );
}