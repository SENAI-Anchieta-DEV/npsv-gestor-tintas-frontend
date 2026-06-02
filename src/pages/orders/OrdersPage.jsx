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
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
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
  cancelarPedido,
  createPedido,
  enviarPedido,
  getFornecedores,
  getPedidos,
  getProdutos,
  receberPedido,
} from "../../services/api";

const STATUS_OPTIONS = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "RECEBIDO", label: "Recebido" },
  { value: "CANCELADO", label: "Cancelado" },
];

const INITIAL_FORM = {
  fornecedorId: "",
  dataPrevisaoEntrega: "",
  observacao: "",
  produtoId: "",
  quantidade: "1",
  precoUnitario: "",
};

function normalizePedido(item) {
  return {
    id: item?.id || "",
    fornecedorId: item?.fornecedor?.id || "",
    fornecedorNome: item?.fornecedor?.razaoSocial || "-",
    status: item?.status || "PENDENTE",
    dataPedido: item?.dataPedido || "",
    dataPrevisaoEntrega: item?.dataPrevisaoEntrega || "",
    observacao: item?.observacao || "",
    itens: Array.isArray(item?.itens) ? item.itens : [],
    valorTotal: Number(item?.valorTotal || 0),
  };
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return value;
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getStatusStyles(status) {
  if (status === "RECEBIDO") {
    return { bg: "success.main", border: "success.main" };
  }
  if (status === "ENVIADO") {
    return { bg: "info.main", border: "info.main" };
  }
  if (status === "CANCELADO") {
    return { bg: "error.main", border: "error.main" };
  }
  return { bg: "warning.main", border: "warning.main" };
}

export default function OrdersPage() {
  const { showSnackbar } = useAppSnackbar();

  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
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
      const [pedidosData, fornecedoresData, produtosData] = await Promise.all([
        getPedidos(),
        getFornecedores(),
        getProdutos(),
      ]);

      setPedidos(Array.isArray(pedidosData) ? pedidosData.map(normalizePedido) : []);
      setFornecedores(Array.isArray(fornecedoresData) ? fornecedoresData : []);
      setProdutos(Array.isArray(produtosData) ? produtosData : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPedidos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const matchesStatus =
        statusFilter === "TODOS" || pedido.status === statusFilter;

      const matchesSearch =
        !term ||
        pedido.fornecedorNome.toLowerCase().includes(term) ||
        String(pedido.id).toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [pedidos, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errors = {};

    if (!form.fornecedorId) errors.fornecedorId = "Selecione o fornecedor.";
    if (!form.produtoId) errors.produtoId = "Selecione o produto.";
    if (!String(form.quantidade).trim() || Number(form.quantidade) <= 0) {
      errors.quantidade = "Informe uma quantidade válida.";
    }
    if (!String(form.precoUnitario).trim() || Number(form.precoUnitario) <= 0) {
      errors.precoUnitario = "Informe um preço unitário válido.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      await createPedido({
        fornecedorId: form.fornecedorId,
        dataPrevisaoEntrega: form.dataPrevisaoEntrega || null,
        observacao: form.observacao || null,
        itens: [
          {
            produtoId: form.produtoId,
            quantidade: Number(form.quantidade),
            precoUnitario: Number(form.precoUnitario),
          },
        ],
      });

      showSnackbar("Pedido cadastrado com sucesso.", "success");
      closeDialog();
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviar(id) {
    try {
      await enviarPedido(id);
      showSnackbar("Pedido enviado com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleReceber(id) {
    try {
      await receberPedido(id);
      showSnackbar("Pedido recebido com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleCancelar(id) {
    try {
      await cancelarPedido(id);
      showSnackbar("Pedido cancelado com sucesso.", "success");
      await loadData();
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
            {row.fornecedorNome}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.id}
          </Typography>
        </Box>
      ),
    },
    {
      key: "datas",
      label: "Datas",
      render: (row) => (
        <Box>
          <Typography sx={{ color: "text.primary", fontSize: 13 }}>
            Pedido: {formatDate(row.dataPedido)}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            Prevista: {formatDate(row.dataPrevisaoEntrega)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "valorTotal",
      label: "Valor Total",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
          {formatMoney(row.valorTotal)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const styles = getStatusStyles(row.status);
        return (
          <Chip
            label={row.status}
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: styles.bg,
              border: "1px solid",
              borderColor: styles.border,
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
      {row.status === "PENDENTE" ? (
        <Tooltip title="Enviar pedido" arrow>
          <IconButton color="info" onClick={() => handleEnviar(row.id)}>
            <LocalShippingOutlinedIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      {row.status === "ENVIADO" ? (
        <Tooltip title="Receber pedido" arrow>
          <IconButton color="success" onClick={() => handleReceber(row.id)}>
            <CheckCircleOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      {row.status !== "RECEBIDO" && row.status !== "CANCELADO" ? (
        <Tooltip title="Cancelar pedido" arrow>
          <IconButton color="error" onClick={() => handleCancelar(row.id)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      ) : null}
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
          title="Pedidos"
          subtitle="Gerencie pedidos de compra enviados aos fornecedores."
          actionLabel="Novo pedido"
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
              placeholder="Buscar por fornecedor ou ID do pedido"
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
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando pedidos..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredPedidos}
            emptyMessage="Nenhum pedido encontrado."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title="Novo pedido"
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Salvar pedido"
      >
        <AppTextField
          select
          required
          name="fornecedorId"
          label="Fornecedor"
          value={form.fornecedorId}
          onChange={handleChange}
          error={Boolean(fieldErrors.fornecedorId)}
          helperText={fieldErrors.fornecedorId}
        >
          {fornecedores.map((fornecedor) => (
            <MenuItem key={fornecedor.id} value={fornecedor.id}>
              {fornecedor.razaoSocial}
            </MenuItem>
          ))}
        </AppTextField>

        <AppTextField
          name="dataPrevisaoEntrega"
          label="Data prevista de entrega"
          type="date"
          value={form.dataPrevisaoEntrega}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />

        <AppTextField
          name="observacao"
          label="Observação"
          value={form.observacao}
          onChange={handleChange}
          multiline
          minRows={3}
        />

        <AppTextField
          select
          required
          name="produtoId"
          label="Produto"
          value={form.produtoId}
          onChange={handleChange}
          error={Boolean(fieldErrors.produtoId)}
          helperText={fieldErrors.produtoId}
        >
          {produtos.map((produto) => (
            <MenuItem key={produto.id} value={produto.id}>
              {produto.descricao}
            </MenuItem>
          ))}
        </AppTextField>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <AppTextField
            required
            name="quantidade"
            label="Quantidade"
            type="number"
            value={form.quantidade}
            onChange={handleChange}
            error={Boolean(fieldErrors.quantidade)}
            helperText={fieldErrors.quantidade}
          />

          <AppTextField
            required
            name="precoUnitario"
            label="Preço unitário"
            type="number"
            value={form.precoUnitario}
            onChange={handleChange}
            error={Boolean(fieldErrors.precoUnitario)}
            helperText={fieldErrors.precoUnitario}
          />
        </Box>
      </AppFormDialog>
    </AdminLayout>
  );
}