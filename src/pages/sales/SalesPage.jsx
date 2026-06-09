import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import AdminLayout from "../../components/layout/AdminLayout";
import AppDataTable from "../../components/common/AppDataTable";
import AppFormDialog from "../../components/common/AppFormDialog";
import AppLoading from "../../components/common/AppLoading";
import AppPageHeader from "../../components/common/AppPageHeader";
import AppTextField from "../../components/common/AppTextField";
import { useAppSnackbar } from "../../components/feedback/AppSnackbarProvider";
import { getProblemDetailMessage } from "../../lib/problemDetail";
import {
  cancelarVenda,
  atualizarVenda,
  concluirVenda,
  deletarVenda,
  getClientes,
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
  const dataAbertura =
    item?.dataAbertura ||
    item?.dataHora ||
    item?.dataCriacao ||
    "";

  return {
    id: item?.id || "",
    clienteId: item?.clienteId || item?.cliente?.id || "",
    clienteNome:
      item?.nomeCliente ||
      item?.cliente?.nome ||
      item?.clienteNome ||
      "-",
    vendedorNome:
      item?.nomeVendedor ||
      item?.vendedor?.nome ||
      item?.vendedorNome ||
      "-",
    valorTotal: Number(item?.valorTotal || 0),
    status: item?.status || "PENDENTE",
    formaPagamento: item?.formaPagamento || "",
    dataAbertura,
    dataAberturaTimestamp: dataAbertura ? new Date(dataAbertura).getTime() : 0,
    itens: Array.isArray(item?.itens)
      ? item.itens.map((it) => ({
          produtoId: it?.produtoId || it?.produto?.id || "",
          descricao:
            it?.nomeProduto ||
            it?.produto?.descricao ||
            it?.descricao ||
            "Produto",
          quantidade: Number(it?.quantidade || 0),
          precoVenda: Number(
            it?.precoPraticado ||
            it?.precoVenda ||
            it?.produto?.precoVenda ||
            0
          ),
        }))
      : [],
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
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVendaId, setEditingVendaId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);
  const [items, setItems] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedQuantidade, setSelectedQuantidade] = useState(1);

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
      const [vendasData, produtosData, clientesData] = await Promise.all([
        loadVendas(),
        getProdutos(),
        getClientes(),
      ]);

      setVendas(vendasData.map(normalizeVenda));
      setProdutos(Array.isArray(produtosData) ? produtosData.map(normalizeProduto) : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
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

    const filtered = vendas.filter((venda) => {
      const matchesSearch =
        !term ||
        venda.vendedorNome.toLowerCase().includes(term) ||
        String(venda.id).toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODAS" || venda.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Ordenar do mais recente para o mais antigo (usando timestamp)
    return filtered.sort((a, b) => {
      return b.dataAberturaTimestamp - a.dataAberturaTimestamp;
    });
  }, [vendas, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleCancelarVenda(vendaId) {
    if (!window.confirm("Tem certeza que deseja cancelar esta venda?")) return;

    try {
      await cancelarVenda(vendaId);
      showSnackbar("Venda cancelada com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  async function handleDeletarVenda(vendaId) {
    if (!window.confirm("Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.")) return;

    try {
      await deletarVenda(vendaId);
      showSnackbar("Venda deletada com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  function openCreateDialog() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setItems([]);
    setSelectedProduto(null);
    setSelectedCliente(null);
    setSelectedQuantidade(1);
    setIsEditMode(false);
    setEditingVendaId(null);
    setDialogOpen(true);
  }

  async function openEditDialog(venda) {
    setSelectedCliente(
      clientes.find((c) => c.id === venda.clienteId) || null
    );

    setItems(
      Array.isArray(venda.itens)
        ? venda.itens.map((it) => ({
            id: it.id,
            descricao: it.descricao,
            quantidade: Number(it.quantidade || 1),
            precoVenda: Number(it.precoVenda || 0),
          }))
        : []
    );

    setForm({
      produtoId: "",
      quantidade: "1",
      formaPagamento: venda.formaPagamento || "",
    });

    setFieldErrors({});
    setSelectedProduto(null);
    setSelectedQuantidade(1);
    setIsEditMode(true);
    setEditingVendaId(venda.id);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setItems([]);
    setSelectedProduto(null);
    setSelectedCliente(null);
    setSelectedQuantidade(1);
    setIsEditMode(false);
    setEditingVendaId(null);
  }

  function validateForm() {
    const errors = {};

    if (!items || items.length === 0) {
      errors.itens = "Adicione pelo menos um item.";
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
      if (isEditMode && editingVendaId) {
        // Editar venda existente
        await atualizarVenda(editingVendaId, {
          clienteId: selectedCliente?.id,
          formaPagamento: form.formaPagamento,
          itens: items.map((it) => ({
            produtoId: it.id,
            quantidade: Number(it.quantidade),
          })),
        });

        showSnackbar("Venda atualizada com sucesso.", "success");
      } else {
        // Iniciar nova venda com um único POST
        const vendedorId = await getUsuarioLogadoId();

        await iniciarVenda({
          vendedorId,
          clienteId: selectedCliente?.id,
          formaPagamento: form.formaPagamento,
          itens: items.map((it) => ({
            produtoId: it.id,
            quantidade: Number(it.quantidade),
          })),
        });

        showSnackbar("Venda iniciada com sucesso. Clique em 'Concluir' para finalizar.", "success");
      }

      closeDialog();
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConcluirVenda(venda) {
    if (!window.confirm("Tem certeza que deseja concluir esta venda?")) return;

    try {
      await concluirVenda(venda.id, {
        clienteId: venda.clienteId || null,
        formaPagamento: venda.formaPagamento || null,
        itens: (venda.itens || []).map((it) => ({
          produtoId: it.produtoId,
          quantidade: Number(it.quantidade),
        })),
      });

      showSnackbar("Venda concluída com sucesso.", "success");
      await loadData();
    } catch (error) {
      showSnackbar(getProblemDetailMessage(error), "error");
    }
  }

  function handleAddItem() {
    if (!selectedProduto) return;
    const produto = selectedProduto;

    setItems((prev) => [
      ...prev,
      {
        id: produto.id,
        descricao: produto.descricao,
        quantidade: Number(selectedQuantidade) || 1,
        precoVenda: produto.precoVenda || 0,
      },
    ]);

    setSelectedProduto(null);
    setSelectedQuantidade(1);
    setFieldErrors((prev) => ({ ...prev, itens: "" }));
  }

  function handleRemoveItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.precoVenda || 0) * Number(it.quantidade || 0)), 0);
  }, [items]);

  const columns = [
    {
      key: "cliente",
      label: "Cliente",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            {row.clienteNome || "-"}
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
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Concluir venda" arrow>
            <span>
              <IconButton 
                size="small"
                disabled={row.status !== "ABERTA"}
                onClick={() => handleConcluirVenda(row)}
                sx={{ color: "success.main" }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Editar venda" arrow>
            <span>
              <IconButton 
                size="small" 
                disabled={row.status !== "ABERTA"}
                onClick={() => openEditDialog(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancelar venda" arrow>
            <span>
              <IconButton 
                size="small"
                disabled={row.status === "CANCELADA" || row.status === "CONCLUIDA"}
                onClick={() => handleCancelarVenda(row)}
                sx={{ color: "warning.main" }}
              >
                <BlockIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Deletar venda" arrow>
            <span>
              <IconButton 
                size="small"
                onClick={() => handleDeletarVenda(row)}
                sx={{ color: "error.main" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
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
          title="Vendas"
          subtitle="Gerencie e acompanhe o histórico de vendas."
          actionLabel="Iniciar venda"
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
        title={isEditMode ? "Editar venda" : "Iniciar venda"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel={isEditMode ? "Atualizar venda" : "Iniciar venda"}
        maxWidth="md"
      >
        {/* Header: Data e Total */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 4, p: 3, backgroundColor: "action.hover", borderRadius: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Data</Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>{formatDateTime(new Date())}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Valor Total</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "primary.main" }}>{formatMoney(total)}</Typography>
          </Box>
        </Box>

        {/* Cliente */}
        <Box sx={{ mb: 4 }}>
          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => option.nome || option.email || ""}
            value={selectedCliente}
            onChange={(e, newValue) => {
              setSelectedCliente(newValue);
              setFieldErrors((prev) => ({ ...prev, cliente: "" }));
            }}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Cliente" 
                variant="outlined"
                error={Boolean(fieldErrors.cliente)}
                helperText={fieldErrors.cliente}
              />
            )}
          />
        </Box>

        {/* Adicionar Item */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: "background.default", borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 600, fontSize: "1.05rem" }}>Itens</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 100px 1fr" }, gap: 2, alignItems: "flex-end" }}>
            <Box>
              <Autocomplete
                options={produtos}
                getOptionLabel={(option) => option.descricao || ""}
                value={selectedProduto}
                onChange={(e, newValue) => setSelectedProduto(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => (
                  <TextField {...params} label="Pesquise e adicione produtos..." size="small" fullWidth />
                )}
              />
            </Box>

            <TextField
              type="number"
              value={selectedQuantidade}
              onChange={(e) => setSelectedQuantidade(e.target.value)}
              inputProps={{ min: 1, step: 1 }}
              size="small"
              fullWidth
              variant="outlined"
            />

            <Button variant="contained" onClick={handleAddItem} fullWidth sx={{ height: 40, fontSize: "1rem" }}>
              Adicionar
            </Button>
          </Box>
          {fieldErrors.itens ? <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>{fieldErrors.itens}</Typography> : null}
        </Box>

        {/* Lista de Itens */}
        <Box sx={{ mb: 4 }}>
          {items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", backgroundColor: "action.hover", borderRadius: 1 }}>
              <Typography color="text.secondary">Nenhum item adicionado.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {items.map((it, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    backgroundColor: "background.default",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>{it.descricao}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {it.quantidade} × {formatMoney(it.precoVenda)} = <strong>{formatMoney(it.precoVenda * it.quantidade)}</strong>
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveItem(idx)} sx={{ color: "error.main" }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Pagamento */}
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, fontSize: "1.05rem" }}>Pagamento</Typography>
          <ToggleButtonGroup
            value={form.formaPagamento}
            exclusive
            onChange={(e, value) => setForm((prev) => ({ ...prev, formaPagamento: value || "" }))}
            aria-label="forma pagamento"
            fullWidth
            size="small"
          >
            <ToggleButton value="DINHEIRO" sx={{ flex: 1 }}>Dinheiro</ToggleButton>
            <ToggleButton value="PIX" sx={{ flex: 1 }}>PIX</ToggleButton>
            <ToggleButton value="CARTAO_CREDITO" sx={{ flex: 1 }}>Crédito</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={form.formaPagamento}
            exclusive
            onChange={(e, value) => setForm((prev) => ({ ...prev, formaPagamento: value || "" }))}
            aria-label="forma pagamento"
            fullWidth
            size="small"
            sx={{ mt: 1.5 }}
          >
            <ToggleButton value="CARTAO_DEBITO" sx={{ flex: 1 }}>Débito</ToggleButton>
            <ToggleButton value="BOLETO" sx={{ flex: 1 }}>Boleto</ToggleButton>
            <ToggleButton value="OUTROS" sx={{ flex: 1 }}>Outros</ToggleButton>
          </ToggleButtonGroup>
          {fieldErrors.formaPagamento ? <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>{fieldErrors.formaPagamento}</Typography> : null}
        </Box>
      </AppFormDialog>
    </AdminLayout>
  );
}