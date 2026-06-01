import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import AdminLayout from "../../components/layout/AdminLayout";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppTextField from "../../components/common/AppTextField";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  concluirVenda,
  getCurrentUserEmailFromToken,
  getCurrentUserRoleFromToken,
  getProdutos,
  getUsuarioByEmail,
  getVendas,
  getVendasByVendedor,
  iniciarVenda,
} from "../../services/api";

const INITIAL_FORM = {
  produtoId: "",
  quantidade: "1",
  formaPagamento: "",
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value || "-";
  }
}

function getStatusStyles(status) {
  if (status === "CONCLUIDA") {
    return {
      backgroundColor: "success.main",
      borderColor: "success.main",
    };
  }

  if (status === "CANCELADA") {
    return {
      backgroundColor: "error.main",
      borderColor: "error.main",
    };
  }

  if (status === "ABERTA") {
    return {
      backgroundColor: "info.main",
      borderColor: "info.main",
    };
  }

  return {
    backgroundColor: "warning.main",
    borderColor: "warning.main",
  };
}

function getStatusLabel(status) {
  if (status === "ABERTA") return "Aberta";
  if (status === "PENDENTE") return "Pendente";
  if (status === "CONCLUIDA") return "Concluída";
  if (status === "CANCELADA") return "Cancelada";
  return status || "-";
}

function normalizeVenda(item) {
  return {
    id: item?.id || "",
    vendedorNome:
      item?.nomeVendedor ||
      item?.vendedor?.nome ||
      item?.vendedorNome ||
      "-",
    valorTotal: Number(item?.valorTotal || 0),
    status: item?.status || "PENDENTE",
    dataAbertura:
      item?.dataAbertura ||
      item?.dataHora ||
      item?.dataCriacao ||
      "",
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizeProduto(item) {
  return {
    id: item?.id || "",
    descricao: item?.descricao || "-",
    unidadeMedida: item?.unidadeMedida || "UN",
    precoVenda: Number(item?.precoVenda || 0),
  };
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

export default function SalesPage() {
  const { showSnackbar } = useAppSnackbar();

  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  async function getUsuarioLogadoId() {
    const emailUsuarioLogado = getCurrentUserEmailFromToken();

    if (!emailUsuarioLogado) {
      throw new Error("Não foi possível identificar o usuário logado.");
    }

    const usuarioLogado = await getUsuarioByEmail(emailUsuarioLogado);
    const vendedorId = getUsuarioIdFromResponse(usuarioLogado);

    if (!vendedorId) {
      throw new Error("Não foi possível localizar o ID do vendedor logado.");
    }

    return vendedorId;
  }

  async function loadVendas() {
    const role = getCurrentUserRoleFromToken();

    if (role === "VENDEDOR") {
      try {
        const vendedorId = await getUsuarioLogadoId();
        const vendasByVendedor = await getVendasByVendedor(vendedorId);
        return Array.isArray(vendasByVendedor) ? vendasByVendedor : [];
      } catch {
        const vendasFallback = await getVendas();
        return Array.isArray(vendasFallback) ? vendasFallback : [];
      }
    }

    const vendasData = await getVendas();
    return Array.isArray(vendasData) ? vendasData : [];
  }

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [vendasData, produtosData] = await Promise.all([
        loadVendas(),
        getProdutos(),
      ]);

      setVendas(vendasData.map(normalizeVenda));
      setProdutos(Array.isArray(produtosData) ? produtosData.map(normalizeProduto) : []);
    } catch (error) {
      setErrorMessage(getProblemDetailMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredVendas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vendas.filter((venda) => {
      const matchesSearch =
        !term ||
        venda.vendedorNome.toLowerCase().includes(term) ||
        String(venda.id).toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODAS" || venda.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendas, search, statusFilter]);

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

    if (!form.produtoId) {
      errors.produtoId = "Selecione o produto.";
    }

    if (!String(form.quantidade).trim() || Number(form.quantidade) <= 0) {
      errors.quantidade = "Informe uma quantidade válida.";
    }

    if (!form.formaPagamento) {
      errors.formaPagamento = "Selecione a forma de pagamento.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const vendedorId = await getUsuarioLogadoId();

      const vendaAberta = await iniciarVenda({
        vendedorId,
      });

      if (!vendaAberta?.id) {
        throw new Error("Não foi possível iniciar a venda.");
      }

      await concluirVenda(vendaAberta.id, {
        formaPagamento: form.formaPagamento,
        itens: [
          {
            produtoId: form.produtoId,
            quantidade: Number(form.quantidade),
          },
        ],
      });

      showSnackbar("Venda registrada com sucesso.", "success");
      closeDialog();
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "id",
      label: "Venda",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.id}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {row.itens.length} item(ns)
          </Typography>
        </Box>
      ),
    },
    {
      key: "vendedor",
      label: "Vendedor",
      render: (row) => (
        <Typography sx={{ color: "text.primary" }}>
          {row.vendedorNome}
        </Typography>
      ),
    },
    {
      key: "dataAbertura",
      label: "Data",
      render: (row) => (
        <Typography sx={{ color: "text.secondary" }}>
          {formatDateTime(row.dataAbertura)}
        </Typography>
      ),
    },
    {
      key: "valorTotal",
      label: "Valor Total",
      render: (row) => (
        <Typography sx={{ color: "text.primary", fontWeight: 800 }}>
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
            label={getStatusLabel(row.status)}
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              backgroundColor: styles.backgroundColor,
              border: "1px solid",
              borderColor: styles.borderColor,
            }}
          />
        );
      },
    },
    {
      key: "acoes",
      label: "Ações",
      render: () => (
        <IconButton disabled>
          <ReceiptLongOutlinedIcon />
        </IconButton>
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
          title="Vendas"
          subtitle="Gerencie e acompanhe o histórico de vendas."
          actionLabel="Nova venda"
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
              placeholder="Buscar por vendedor ou ID da venda"
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
              <MenuItem value="ABERTA">Aberta</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="CONCLUIDA">Concluída</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </AppTextField>
          </Box>
        </Box>

        {loading ? (
          <AppLoading message="Carregando vendas..." />
        ) : (
          <AppDataTable
            columns={columns}
            rows={filteredVendas}
            emptyMessage="Nenhuma venda encontrada."
          />
        )}
      </Box>

      <AppFormDialog
        open={dialogOpen}
        title="Nova venda"
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Registrar venda"
      >
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

        <AppTextField
          select
          required
          name="formaPagamento"
          label="Forma de pagamento"
          value={form.formaPagamento}
          onChange={handleChange}
          error={Boolean(fieldErrors.formaPagamento)}
          helperText={fieldErrors.formaPagamento}
        >
          <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
          <MenuItem value="PIX">Pix</MenuItem>
          <MenuItem value="CARTAO_DEBITO">Cartão de débito</MenuItem>
          <MenuItem value="CARTAO_CREDITO">Cartão de crédito</MenuItem>
          <MenuItem value="BOLETO">Boleto</MenuItem>
          <MenuItem value="OUTROS">Outros</MenuItem>
        </AppTextField>

        <AppTextField
          required
          name="quantidade"
          label="Quantidade"
          type="number"
          value={form.quantidade}
          onChange={handleChange}
          error={Boolean(fieldErrors.quantidade)}
          helperText={fieldErrors.quantidade}
          inputProps={{ min: 1, step: 1 }}
        />
      </AppFormDialog>
    </AdminLayout>
  );
}